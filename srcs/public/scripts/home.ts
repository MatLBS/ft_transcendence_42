import { applyLink } from './utils.js';

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLAnchorElement;
		applyLink(target, e);
	});
}