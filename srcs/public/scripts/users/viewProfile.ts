import { recvContent } from '../../main.js';
import { applyLink } from '../utils.js';

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		applyLink(target, e);

		if (target.tagName === "BUTTON" && target.id === "add-friends") {
			handleFriends("addFriends");
		}
		if (target.tagName === "BUTTON" && target.id === "delete-friends") {
			handleFriends("deleteFriends");
		}
	});
}

async function handleFriends(action: string) {
	const urlParts = window.location.pathname.split('/');
	const username = urlParts[urlParts.length - 1];

	const response = await fetch(`/${action}/${username}`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = await response.json();
	alert(data.message);
	recvContent(`/users/${username}`);
}
