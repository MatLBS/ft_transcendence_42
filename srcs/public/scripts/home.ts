import { applyLink } from './utils.js';

/** @global */
declare var Chart: any;

const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLAnchorElement;
		applyLink(target, e);
	});
}
displayStats("getMatchsResults");


async function displayStats(root:string){

	let gamesWinSolo = 0;
	let gamesWinLocal = 0;
	let gamesWinTournament = 0;
	let gamesLoseSolo = 0;
	let gamesLoseLocal = 0;
	let gamesLoseTournament = 0;

	let userName: string = '';
	let userId : number;
	let localMatches: {id : number, winner: string; loser: string; winnerScore: number; loserScore: number; matchDate: string }[] = [];
	let soloMatches: { id:number , winner: string; loser: string; winnerScore: number; loserScore: number; matchDate: string }[] = [];
	let tournamentMatches: { id:number , winner: string; loser: string; winnerScore: number; loserScore: number; matchDate: string }[] = [];
	await fetch(root, {
		method: 'GET',
		credentials: 'include',
	})
	.then(async (response) => {
		const data = await response.json();
		localMatches = data.matchs.local;
		soloMatches = data.matchs.solo;
		tournamentMatches = data.matchs.tournament;
		userName = data.user;
		userId = data.userId;
		console.log("userid = ", userId);
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
	
	const global = document.getElementById('homeStats') as HTMLCanvasElement | null;
	if (!global) {
		console.error('Canvas non trouvé !');
		return;
	}
	new Chart(global, {
		type: 'doughnut',
		data: {
		labels: ['Wins', 'Losses'],
		datasets: [{
			data: [gamesWin, gamesLose],
			backgroundColor: ['red', 'blue']
		}],
		},
		options: {
			cutout: '70%',
			circumference : 360,
			responsive: true,
			maintainAspectRatio: false,
			animation: {
				animateRotate: true,
			},
		}
	});
}
