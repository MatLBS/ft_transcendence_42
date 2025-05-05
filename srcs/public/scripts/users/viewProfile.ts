import { recvContent } from '../../main.js';
import { displayGlobal, displayMatches, charts} from '../stats.js';

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;

		if (target.tagName === "BUTTON" && target.id === "add-friends") {
			handleFriends("addFriends");
		}
		if (target.tagName === "BUTTON" && target.id === "delete-friends") {
			handleFriends("deleteFriends");
		}
		if (target.tagName === 'SPAN' && target.id === 'global') {
			const divGlobal = document.getElementById('divGlobal');
			if (divGlobal)
			{
				divGlobal.classList.toggle('none');
				charts.globalPieChart.reset();
				charts.globalPieChart.update();
				charts.barChart.reset()
				charts.barChart.update();
			}
			return;
		}
		if (target.tagName === 'SPAN' && target.id === 'local') {
			const divLocal = document.getElementById('divLocal');
			if (divLocal)
			{
				divLocal.classList.toggle('openStats');
				charts.localBarChart.reset();
				charts.localBarChart.update();
				charts.localPieChart.reset();
				charts.localPieChart.update();
			}
			return;
		}
		if (target.tagName === 'SPAN' && target.id === 'solo') {
			const divSolo = document.getElementById('divSolo');
			if (divSolo)
			{
				divSolo.classList.toggle('openStats');
				charts.soloBarChart.reset();
				charts.soloBarChart.update();
				charts.soloPieChart.reset();
				charts.soloPieChart.update();
			}
			return;
		}
		if (target.tagName === 'SPAN' && target.id === 'tournament') {
			const divTournament = document.getElementById('divTournament');
			if (divTournament)
			{
				divTournament.classList.toggle('openStats');
				charts.tournamentBarChart.reset();
				charts.tournamentBarChart.update();
				charts.tournamentPieChart.reset();
				charts.tournamentPieChart.update();
			}
			return;
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

window.addEventListener('users', async (event: Event) => {
	displayStats();
});

async function displayStats() {
	const titleErrorElements = document.getElementsByClassName('title-error');
	if (titleErrorElements.length != 0)
		return;
	const urlParts = window.location.pathname.split('/');
	const username = urlParts[urlParts.length - 1];
	await displayMatches(`/getExternalMatchsResults/${username}`);
	await displayGlobal(`/getExternalMatchsResults/${username}`);
}

displayStats();
