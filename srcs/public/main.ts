// Définition du type pour la réponse serveur
interface ResponseData {
	content: string;
	error?: string;
}

// Fait une requête au serveur pour récupérer le contenu de la page demandée (sans recharger la page)
function recvContent(url: string): void {
	fetch('/url', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ url }),
	})
		.then((response: Response) => response.json())
		.then((data: { js: string; css: string; content: string; errcode?: number }) => {

			document.getElementById('js')?.remove();
			document.getElementById('css')?.remove();

			const appElement = document.getElementById('app');
			if (appElement)
				appElement.innerHTML = data.content;
			if (data.css) {
				const linkElement = document.createElement('link');
				linkElement.rel = 'stylesheet';
				linkElement.href = data.css;
				linkElement.id = "css";
				document.head.appendChild(linkElement);
			}
			if (data.js) {
				const scriptElement = document.createElement('script');
				scriptElement.type = 'module';
				scriptElement.src = data.js;
				scriptElement.id = "js";
				document.body.appendChild(scriptElement);
			}
			handleLinks();
		})
		.catch((error: unknown) => {
			console.error('Erreur lors de la récupération du contenu:', error);
		});
}

function linkClickHandler(e: MouseEvent): void {
	console.log('Click sur un lien:', e);
	e.preventDefault();
	const target = e.currentTarget as HTMLAnchorElement;
	window.history.pushState({}, '', target.href);
	recvContent(target.href);
}

function handleLinks(): void {
	const links: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a.my');
	links.forEach((link: HTMLAnchorElement) => {
		// D'abord, retirer l'écouteur s'il est déjà attaché
		link.removeEventListener('click', linkClickHandler);
		// Puis, ajouter l'écouteur
		link.addEventListener('click', linkClickHandler);
	});
}

function handleLogout(): void {
	const link: HTMLAnchorElement | null = document.querySelector('a.logout');
	if (link) {
		console.log('Logout link found:', link);
		link.addEventListener('click', (e: MouseEvent) => {
			e.preventDefault();
			console.log('Déconnexion...');
			fetch('/logout', {
				method: 'POST',
				credentials: 'include',
			})
				.then((response: Response) => response.json())
				.then((data: {status: number}) => {
					console.log('Logout response:', data);
					if (data.status === 200) {
						// recvContent('/login'); a voir
						window.location.href = '/login';
					}
				})
				.catch((error: unknown) => {
					console.error('Erreur lors de la déconnexion:', error);
				});
		});
	}
}

// Gère le retour en arrière du navigateur
window.addEventListener('popstate', () => {
	recvContent(window.location.pathname);
});

// Lance la fonction recvContent au chargement de la page
function start(): void {
	console.log('Démarrage...');
	recvContent(window.location.pathname);
}

// Initialisation
start();
handleLinks();
handleLogout();
