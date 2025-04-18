import { applyLink } from './utils.js';
import { recvContent } from '../main.js';

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		applyLink(target, e);
		if (target.tagName === "BUTTON" && target.className === "remove_friend") {
			const username = target.getAttribute("data-username");
			if (username) {
				handleFriends(username);
			}
		}
	});
}

export async function handleFriends(username: string) {
	const response = await fetch(`/deleteFriends/${username}`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = await response.json();
	alert(data.message);
	recvContent(`/profil`);
}
