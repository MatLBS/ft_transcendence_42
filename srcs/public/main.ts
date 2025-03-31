// Définition du type pour la réponse serveur
interface ResponseData {
	content: string;
	error?: string;
}

// Fait une requête au serveur pour récupérer le contenu de la page demandée (sans recharger la page)
function recvContent(url: string): void {
	fetch('/url', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ url }),
	})
		.then((response: Response) => response.json())
		.then((data: { js: string; css: string; content: string; errcode?: number }) => {

			const existingScript = document.getElementById('js');
			if (existingScript)
				existingScript.remove();
			const existingCss = document.getElementById('css');
			if (existingCss)
				existingCss.remove();

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
		})
		.catch((error: unknown) => {
			console.error('Erreur lors de la récupération du contenu:', error);
		});
}

// Gère les balises <a> avec la classe 'my'
function handleLinks(): void {
	const links: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a.my');

	links.forEach((link: HTMLAnchorElement) => {
		link.addEventListener('click', (e: MouseEvent) => {
			e.preventDefault();
			const target = e.currentTarget as HTMLAnchorElement;
			window.history.pushState({}, '', target.href);
			recvContent(target.href);
		});
	});
}

// Gère le retour en arrière du navigateur
window.addEventListener('popstate', () => {
	recvContent(window.location.pathname);
});

// Lance la fonction recvContent au chargement de la page
function start(): void {
	// alert('Page is loading...');
	recvContent(window.location.pathname);
}

// Initialisation
start();
handleLinks();
