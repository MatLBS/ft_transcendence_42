import { recvContent } from '../main.js';

/// Fonction pour gérer les clics sur les liens dynamiques
/// @param target - L'élément cible du clic
/// @param e - L'événement de clic
/// @returns void
/// @description Cette fonction empêche le comportement par défaut du lien et charge le contenu de la page cible
/// en utilisant la fonction recvContent. Elle met également à jour l'URL de l'historique du navigateur.
export function applyLink(target: HTMLElement, e: Event): void {
	if (target.tagName === 'A' && target.classList.contains('my')) {
		e.preventDefault();
		const url = target.getAttribute('href');
		if (url) {
			recvContent(url);
		}
	}
}

export const getInputValue = (id: string): string => {
	const input = document.getElementById(id) as HTMLInputElement | null;
	return input?.value ?? '';
};
