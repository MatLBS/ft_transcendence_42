import { applyLink } from './utils.js';
import { recvContent } from '../main.js';
import { displayGlobal, displayMatches, charts} from './stats.js';
/** @global */
declare var Chart: any;

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		if (target.closest("button.remove-friend")) {
			const username = target.getAttribute("data-username");
			if (username) {
				removeFriends(username);
			}
		}
		applyLink(target, e);
		if (target.closest('#custom-select'))  {
			const customOptions = document.getElementById('custom-options');
			if (customOptions) customOptions.classList.toggle('open');
			return;
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
				divLocal.classList.toggle('open');
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
				divSolo.classList.toggle('open');
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
				divTournament.classList.toggle('open');
				charts.tournamentBarChart.reset();
				charts.tournamentBarChart.update();
				charts.tournamentPieChart.reset();
				charts.tournamentPieChart.update();
			}
			return;
		}
		if (target.tagName === 'BUTTON' && target.id === 'open-friends') {
			const friends = document.getElementById('container');
			if (friends) friends.classList.toggle('open-friends');
			return;
		}
		if (target.tagName === 'BUTTON' && target.id === 'close-friends') {
			const friends = document.getElementById('container');
			if (friends) friends.classList.remove('open-friends');
			return;
		}
	});
}

export async function removeFriends(username: string) {
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

window.addEventListener("scroll", () => {
	const button = document.getElementById("open-friends");
		if (!button) return;
		const threshold = 120;
	if (window.scrollY > threshold) {
			button.classList.add("btn-fix");
			button.classList.remove("btn-abs");
		} else {
			button.classList.remove("btn-fix");
			button.classList.add("btn-abs");
		}
});

// displayMatches("getMatchsResults");
// displayGlobal("getMatchsResults");
