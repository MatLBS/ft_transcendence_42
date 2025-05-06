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

let ws: WebSocket;
export async function hangleNewGames() {
	const urlParts = window.location.pathname.split('/');
	const username = urlParts[urlParts.length - 1];
	ws = new WebSocket(`ws://localhost:3000/wsNewGame/${username}`,);

	ws.onmessage = (event) => {
		const data = JSON.parse(event.data);
		if (data.lastMatch){
			if (data.lastMatch.winnerId !== 0)
				data.lastMatch.winner = data.username;
			if (data.lastMatch.loserId !== 0)
				data.lastMatch.loser = data.username;
			const divParent = document.createElement('div');
			const match__history = document.getElementById('match__history') as HTMLInputElement | null;
			divParent.classList.add('flex', 'justify-around', 'align-center', 'text-center', 'm-2');

			const typeCell = document.createElement('p');
			typeCell.textContent = data.type;
			typeCell.classList.add('w-1/6', 'max-w-48', 'overflow-hidden');

			const winnerCell = document.createElement('p');
			winnerCell.textContent = data.lastMatch.winner;
			winnerCell.classList.add('w-1/6', 'max-w-48', 'overflow-hidden');

			const loserCell = document.createElement('p');
			loserCell.textContent = data.lastMatch.loser;
			loserCell.classList.add('w-1/6', 'max-w-48', 'overflow-hidden');

			const scoreCell = document.createElement('p');
			scoreCell.textContent = `${data.lastMatch.winnerScore} - ${data.lastMatch.loserScore}`;
			scoreCell.classList.add('w-1/6', 'max-w-48', 'overflow-hidden');

			const dateCell = document.createElement('p');
			const matchDate = new Date(data.lastMatch.matchDate);
			const formattedDateTime = matchDate.toLocaleString('en-GB', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
			dateCell.textContent = formattedDateTime;
			dateCell.classList.add('w-1/6', 'max-w-48', 'overflow-hidden');

			divParent.appendChild(typeCell);
			divParent.appendChild(winnerCell);
			divParent.appendChild(loserCell);
			divParent.appendChild(scoreCell);
			divParent.appendChild(dateCell);
			match__history?.appendChild(divParent);
		}
	}
}

displayStats();
hangleNewGames();
