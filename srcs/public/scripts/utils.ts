import { recvContent } from '../main.js';

export function applyLink(target: HTMLElement, e: Event): void {
	if (target.tagName === 'A' && target.classList.contains('my')) {
		e.preventDefault();
		const url = target.getAttribute('href');
		if (url) {
			recvContent(url);
			window.history.pushState({}, '', url);
		}
	}
}
