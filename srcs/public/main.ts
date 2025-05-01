import { json } from 'stream/consumers';
import { applyLink } from './scripts/utils.js';

export let language = "en";

// Définition du type pour la réponse serveur
interface ResponseData {
	content: string;
	js?: string;
	css?: string;
	errcode?: number;
	isConnected: boolean;
}

export async function navigateTo(url: string): Promise<void> {
	recvContent(url);
	history.pushState({}, '', url);
}

// Fait une requête au serveur pour récupérer le contenu de la page demandée (sans recharger la page)
export async function recvContent(url: string): Promise<void> {
	const searchInput = document.getElementById('search-input') as HTMLInputElement;
	if (searchInput) {
		searchInput.value = '';
		const searchResults = document.getElementById('search-results');
		if (searchResults) {
			searchResults.classList.remove('results');
			searchResults.innerHTML = '';
		}
	}
	let jsonLanguage;
	await fetch('/languages', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ language }),
	})
		.then(async (response) => {
			jsonLanguage = await response.json();
		})
		.catch((error: unknown) => {
			console.error('Erreur lors de la récupération du contenu:', error);
		});

	await fetch('/url', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ url, jsonLanguage }),
	})
		.then((response: Response) => response.json())
		.then(updatePageContent)
		.catch((error: unknown) => {
			console.error('Erreur lors de la récupération du contenu:', error);
		});
	url = url.split('/')[1] || url;
	setTimeout(() => {
		window.dispatchEvent(new CustomEvent(url));
	}, 100);
}

// Met à jour le contenu de la page avec les données reçues du serveur
function updatePageContent(data: ResponseData): void {
	// Supprime les anciens fichiers CSS et JS
	document.getElementById('js')?.remove();
	document.getElementById('css')?.remove();

	// Met à jour le contenu principal
	const appElement = document.getElementById('app');
	if (appElement) appElement.innerHTML = data.content;

	// Ajoute le fichier CSS si présent
	if (data.css) {
		const linkElement = document.createElement('link');
		linkElement.rel = 'stylesheet';
		linkElement.href = data.css;
		linkElement.id = 'css';
		document.head.appendChild(linkElement);
	}

	// Ajoute le fichier JS si présent
	if (data.js) {
		const scriptElement = document.createElement('script');
		scriptElement.type = 'module';
		scriptElement.src = data.js;
		scriptElement.id = 'js';
		document.body.appendChild(scriptElement);
	}

	// Met à jour l'affichage des éléments connectés/déconnectés
	hideElements(data.isConnected);
}

// Affiche ou masque les éléments en fonction de l'état de connexion de l'utilisateur
function hideElements(isConnected: boolean): void {
	const toggleDisplay = (selector: string, display: string) => {
		document.querySelectorAll(selector).forEach((el) => {
			(el as HTMLElement).style.display = display;
		});
	};

	if (isConnected) {
		toggleDisplay('.disconnected', 'none');
		toggleDisplay('.connected', 'block');
	} else {
		toggleDisplay('.connected', 'none');
		toggleDisplay('.disconnected', 'block');
	}
}

// Gère les clics sur les liens dynamiques avec délégation d'événements
function handleLinks(): void {
	const app = document.querySelector('#app');
	if (!app) return;
	app.removeEventListener('click', seeTarget as EventListener);
	app.addEventListener('click', seeTarget as EventListener);
}

function seeTarget(e: MouseEvent): void {
	const target = e.target as HTMLAnchorElement;
	applyLink(target, e);
	if (target.closest('nav')) {
		if (target.tagName === 'A' && target.classList.contains('logout')) {
			handleLogout(e);
		}
		if (target.closest('#language-select'))  {
			const languageOptions = document.getElementById('languages-options');
			if (languageOptions)
				languageOptions.classList.toggle('open');
		}
		if (target.tagName === 'LI' && target.id === 'language-options')
			handleLanguage(e);
		if (target.matches('#search-input')) {
			handleSearch();
		}
		if (target.closest('#burger')) {
			const burgerMenu = document.getElementById('burger-menu');
			if (burgerMenu) {
				burgerMenu.classList.toggle('open-mobile');
			}
		}
	}
}

async function handleLanguage(e: Event): Promise<void> {
	const target = e.target as HTMLElement;
	const languageDefault = document.getElementById('language-default');

	if (!languageDefault) {
		console.error('One or more elements for custom select are missing.');
		return;
	}
	languageDefault.innerHTML = `
	${target.textContent}
	<span class="material-icons pl-2">expand_more</span>`;
	language = target.getAttribute('data-value') || '';
	await fetch('/updateUserLanguage', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ language }),
	})
		.catch((error: unknown) => {
			console.error('Erreur lors de la récupération du contenu:', error);
		});

	recvContent(window.location.pathname);
}

function handleLogout(e: Event): void {
	e.preventDefault();
	fetch('/logout', {
		method: 'GET',
		credentials: 'include',
	})
		.then((response: Response) => response.json())
		.then((data: { status: number }) => {
			if (data.status === 200) {
				navigateTo('/login');
			}
		})
		.catch((error: unknown) => {
			console.error('Erreur lors de la déconnexion:', error);
		});
}

// Gère le retour en arrière du navigateur
function handlePopState(): void {
	window.addEventListener('popstate', () => {
		recvContent(window.location.pathname);
	});
}

function handleSearch(): void {
	const searchInput = document.getElementById('search-input') as HTMLInputElement;
	if (searchInput) {
		searchInput.addEventListener('input', (e: Event) => {
			const searchValue = (e.target as HTMLInputElement).value;
			const searchResults = document.getElementById('search-results');
			if (!searchResults) return;
			if (searchValue.length < 1) {
				searchResults.classList.remove('results');
				searchResults.innerHTML = '';
				return;
			}
			fetch('/search', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ searchValue }),
			})
				.then((response: Response) => response.json())
				.then((data: { users: Array<{ profilePicture: string, username: string; }> }) => {
					searchResults.innerHTML = '';
					searchResults.classList.add('results');
					data.users.slice(0, 3).forEach((user) => {
						const userElement = document.createElement('div');
						userElement.classList.add('user-result');
						userElement.innerHTML = `
							<a href="/users/${user.username}" class="user-link my">
								<img src="${user.profilePicture}" alt="${user.username}'s profile picture" class="profile-picture" />
								<p>${user.username}</p>
							</a>
						`;
						searchResults.appendChild(userElement);
					});
					handleLinks();
				})
				.catch((error: unknown) => {
					console.error('Erreur lors de la recherche:', error);
				});
		});
	}
}

// Initialise l'application
function start(): void {
	console.log('Démarrage...');
	recvContent(window.location.pathname);
	handleLinks();
	handlePopState();
}

// Gère l'événement de fermeture de la fenêtre
window.addEventListener('beforeunload', (event: BeforeUnloadEvent) => {
	const token = document.cookie.split('; ').find(row => row.startsWith('access_token='));
	const tokenValue = token ? token.split('=')[1] : '';
	navigator.sendBeacon('/quit', JSON.stringify({ token: tokenValue }));
});

// Lancement de l'application
start();
