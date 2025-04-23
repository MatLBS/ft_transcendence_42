import { applyLink } from './utils.js';
import { recvContent } from '../main.js';
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
		// Gestion des clics sur le bouton "Validation"
		if (target.tagName === 'SPAN' && target.id === 'global') {
			const divGlobal = document.getElementById('divGlobal');
			if (divGlobal) divGlobal.classList.toggle('none');
			return;
		}
		if (target.tagName === 'SPAN' && target.id === 'local') {
			const divLocal = document.getElementById('divLocal');
			if (divLocal) divLocal.classList.toggle('open');
			return;
		}
		if (target.tagName === 'SPAN' && target.id === 'solo') {
			const divSolo = document.getElementById('divSolo');
			if (divSolo) divSolo.classList.toggle('open');
			return;
		}
		if (target.tagName === 'SPAN' && target.id === 'tournament') {
			const divTournament = document.getElementById('divTournament');
			if (divTournament) divTournament.classList.toggle('open');
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
async function displayMatches() {
	const match__history = document.getElementById('match__history') as HTMLInputElement | null;


	await fetch('getMatchsResults', {
		method: 'GET',
		credentials: 'include',
	})
	.then(async (response) => {
		const data = await response.json();
		const localMatches = data.local;
		const soloMatches = data.solo;
		const tournamentMatches = data.tournament;

		for (let i = 0; i < localMatches.length; i++) {
			const divLocal = document.createElement('div');
			divLocal.classList.add('flex', 'justify-around', 'align-center', 'text-center', 'm-2');

			const typeCell = document.createElement('p');
			typeCell.textContent = 'Local';
			typeCell.classList.add('w-1/6');

			const winnerCell = document.createElement('p');
			winnerCell.textContent = localMatches[i].winner;
			winnerCell.classList.add('w-2/6');

			const loserCell = document.createElement('p');
			loserCell.textContent = localMatches[i].loser;
			loserCell.classList.add('w-2/6');

			const scoreCell = document.createElement('p');
			scoreCell.textContent = `${localMatches[i].winnerScore} - ${localMatches[i].loserScore}`;
			scoreCell.classList.add('w-1/6');

			if (i % 2 === 0)
				divLocal.classList.add('bg-gray-100');

			divLocal.appendChild(typeCell);
			divLocal.appendChild(winnerCell);
			divLocal.appendChild(loserCell);
			divLocal.appendChild(scoreCell);
			match__history?.appendChild(divLocal);
		}

		for (let i = 0; i < soloMatches.length; i++) {
			const divSolo = document.createElement('div');
			divSolo.classList.add('flex', 'justify-around', 'align-center', 'text-center', 'm-2');

			const typeCell = document.createElement('p');
			typeCell.textContent = 'Solo';
			typeCell.classList.add('w-1/6');

			const winnerCell = document.createElement('p');
			winnerCell.textContent = soloMatches[i].winner;
			winnerCell.classList.add('w-2/6');

			const loserCell = document.createElement('p');
			loserCell.textContent = soloMatches[i].loser;
			loserCell.classList.add('w-2/6');

			const scoreCell = document.createElement('p');
			scoreCell.textContent = `${soloMatches[i].winnerScore} - ${soloMatches[i].loserScore}`;
			scoreCell.classList.add('w-1/6');

			if ((localMatches.length + i) % 2 === 0) {
			divSolo.classList.add('bg-gray-100');
			}

			divSolo.appendChild(typeCell);
			divSolo.appendChild(winnerCell);
			divSolo.appendChild(loserCell);
			divSolo.appendChild(scoreCell);

			match__history?.appendChild(divSolo);
		}

		for (let i = 0; i < tournamentMatches.length; i++) {
			const divTournament = document.createElement('div');
			divTournament.classList.add('flex', 'justify-around', 'align-center', 'text-center', 'm-2');

			const typeCell = document.createElement('p');
			typeCell.textContent = 'Tournament';
			typeCell.classList.add('w-1/6');

			const winnerCell = document.createElement('p');
			winnerCell.textContent = tournamentMatches[i].winner;
			winnerCell.classList.add('w-2/6');

			const loserCell = document.createElement('p');
			loserCell.textContent = tournamentMatches[i].loser;
			loserCell.classList.add('w-2/6');

			const scoreCell = document.createElement('p');
			scoreCell.textContent = `${tournamentMatches[i].winnerScore} - ${tournamentMatches[i].loserScore}`;
			scoreCell.classList.add('w-1/6');

			if ((localMatches.length + soloMatches.length + i) % 2 === 0) {
			divTournament.classList.add('bg-gray-100');
			}

			divTournament.appendChild(typeCell);
			divTournament.appendChild(winnerCell);
			divTournament.appendChild(loserCell);
			divTournament.appendChild(scoreCell);

			match__history?.appendChild(divTournament);
		}
	})
}

async function displayGraphs() {

	let gamesWinSolo = 0;
	let gamesWinLocal = 0;
	let gamesWinTournament = 0;
	let gamesLoseSolo = 0;
	let gamesLoseLocal = 0;
	let gamesLoseTournament = 0;

	let userName: string = '';

	await fetch('/getUser', {
		method: 'GET',
		credentials: 'include',
	})
		.then(async (response) => {
			const data = await response.json();
			userName = data.user.username as string;
		})

	await fetch('getMatchsResults', {
		method: 'GET',
		credentials: 'include',
	})
	.then(async (response) => {
		const data = await response.json();
		const localMatches = data.local;
		const soloMatches = data.solo;
		const tournamentMatches = data.tournament;
		for (let i = 0; i < localMatches.length; i++)
			localMatches[i].winner === userName ? gamesWinLocal++ : gamesLoseLocal++;
		for (let i = 0; i < soloMatches.length; i++)
			soloMatches[i].winner === userName ? gamesWinSolo++ : gamesLoseSolo++;
		for (let i = 0; i < tournamentMatches.length; i++)
			tournamentMatches[i].winner === userName ? gamesWinTournament++ : gamesLoseTournament++;
	});

	const gamesWin = gamesWinSolo + gamesWinLocal + gamesWinTournament;
	const gamesLose = gamesLoseSolo + gamesLoseLocal + gamesLoseTournament;

	if (gamesWin + gamesLose === 0)
		return;

	const global = document.getElementById('globalChart') as HTMLCanvasElement | null;
	if (!global) {
		console.error('Canvas non trouvé !');
		return;
	}
	const myChart = new Chart(global, {
		type: 'doughnut',
		data: {
		labels: ['Win', 'Lose'],
		datasets: [{
			data: [gamesWin, gamesLose],
			backgroundColor: ['red', 'blue']
		}]
		}
	});

	if (gamesWinLocal + gamesLoseLocal !== 0) {
		const local = document.getElementById('localChart') as HTMLCanvasElement | null;
		if (!local) {
			console.error('Canvas non trouvé !');
			return;
		}
		const myChart2 = new Chart(local, {
			type: 'doughnut',
			data: {
			labels: ['Win', 'Lose'],
			datasets: [{
				data: [gamesWinLocal, gamesLoseLocal],
				backgroundColor: ['red', 'blue']
			}]
			}
		});
	}

	if (gamesWinSolo + gamesLoseSolo !== 0) {
		const solo = document.getElementById('soloChart') as HTMLCanvasElement | null;
		if (!solo) {
			console.error('Canvas non trouvé !');
			return;
		}
		const myChart3 = new Chart(solo, {
			type: 'doughnut',
			data: {
			labels: ['Win', 'Lose'],
			datasets: [{
				data: [gamesWinSolo, gamesLoseSolo],
				backgroundColor: ['red', 'blue']
			}]
			}
		});
	}


	if (gamesWinTournament + gamesLoseTournament !== 0) {
		const tournament = document.getElementById('tournamentChart') as HTMLCanvasElement | null;
		if (!tournament) {
			console.error('Canvas non trouvé !');
			return;
		}
		const myChart4 = new Chart(tournament, {
			type: 'doughnut',
			data: {
			labels: ['Win', 'Lose'],
			datasets: [{
				data: [gamesWinTournament, gamesLoseTournament],
				backgroundColor: ['red', 'blue']
			}]
			}
		});
	}

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

displayMatches();
displayGraphs();
