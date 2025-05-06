/** @global */
declare var Chart: any;



export const charts: {
	globalPieChart?: typeof Chart,
	localPieChart?: typeof Chart,
	soloPieChart?: typeof Chart,
	tournamentPieChart?: typeof Chart,
	barChart?: typeof Chart,
	localBarChart?: typeof Chart,
	soloBarChart?: typeof Chart,
	tournamentBarChart?: typeof Chart
} = {};

function displayStats(typeMatch: Array<any>, match__history: HTMLInputElement | null, data: any) {
	for (let i = 0; i < typeMatch.length; i++) {
		if (typeMatch[i].winnerId !== 0)
			typeMatch[i].winner = data.user;
		if (typeMatch[i].loserId !== 0)
			typeMatch[i].loser = data.user;
		const divParent = document.createElement('div');
		divParent.classList.add('flex', 'justify-around', 'align-center', 'text-center', 'm-2');

		const typeCell = document.createElement('p');
		typeCell.textContent = typeMatch[i].type;
		typeCell.classList.add('w-1/6', 'max-w-48', 'overflow-hidden');

		const winnerCell = document.createElement('p');
		winnerCell.textContent = typeMatch[i].winner;
		winnerCell.classList.add('w-1/6', 'max-w-48', 'overflow-hidden');

		const loserCell = document.createElement('p');
		loserCell.textContent = typeMatch[i].loser;
		loserCell.classList.add('w-1/6', 'max-w-48', 'overflow-hidden');

		const scoreCell = document.createElement('p');
		scoreCell.textContent = `${typeMatch[i].winnerScore} - ${typeMatch[i].loserScore}`;
		scoreCell.classList.add('w-1/6', 'max-w-48', 'overflow-hidden');

		const dateCell = document.createElement('p');
		const matchDate = new Date(typeMatch[i].matchDate);
		const formattedDateTime = matchDate.toLocaleString('en-GB', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
		dateCell.textContent = formattedDateTime;
		dateCell.classList.add('w-1/6', 'max-w-48', 'overflow-hidden');

		if (i % 2 === 0)
			divParent.classList.add('bg-gray-500', 'rounded-xl');

		divParent.appendChild(typeCell);
		divParent.appendChild(winnerCell);
		divParent.appendChild(loserCell);
		divParent.appendChild(scoreCell);
		divParent.appendChild(dateCell);
		match__history?.appendChild(divParent);
	}
}


export async function displayMatches(root:string) {
	const match__history = document.getElementById('match__history') as HTMLInputElement | null;

	await fetch(root, {
		method: 'GET',
		credentials: 'include',
	})
	.then(async (response) => {
		const data = await response.json();
		const localMatches = data.matchs.local;
		localMatches.forEach((match: MatchData & { type?: string }) => {
			match.type = 'Local';
		});
		const soloMatches = data.matchs.solo;
		soloMatches.forEach((match: MatchData & { type?: string }) => {
			match.type = 'Solo';
		});
		const tournamentMatches = data.matchs.tournament;
		tournamentMatches.forEach((match: MatchData & { type?: string }) => {
			match.type = 'Tournament';
		});

		const totalMatches = localMatches.concat(soloMatches, tournamentMatches);
		totalMatches.sort((a: MatchData, b: MatchData) => {
			return new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime();
		});
		displayStats(totalMatches, match__history, data);
	})
}

interface MatchData {
	id: number;
	loser: string;
	loserScore: number;
	matchDate: string;
	winner: string;
	winnerScore: number;
	winnerId : number;
	looserId : number;
}

interface DailyResult {
	date: string;
	wins: number;
	losses: number;
}

function getDailyWinLoss(localMatches: MatchData[], userId: number): DailyResult[] {
	const now = new Date();
	const today = new Date(now);
	today.setUTCHours(0, 0, 0, 0); // Start of today in UTC

	// Generate dates for the last 7 days (including today)
	const dates: string[] = [];
	for (let i = 6; i >= 0; i--) {
		const date = new Date(today);
		date.setUTCDate(date.getUTCDate() - i);
		dates.push(date.toISOString().split('T')[0]);
	}

	// Initialize daily counts
	const dailyCounts = new Map<string, { wins: number; losses: number }>();
	dates.forEach(date => {
		dailyCounts.set(date, { wins: 0, losses: 0 });
	});

	// Process each match
	localMatches.forEach(match => {
		const matchDate = new Date(match.matchDate);

		// Skip future matches
		if (matchDate > now) return;

		const matchDateStr = matchDate.toISOString().split('T')[0];
		const dailyResult = dailyCounts.get(matchDateStr);

			if (dailyResult) {
				if (match.winnerId === userId) {
					dailyResult.wins++;
				} else {
					dailyResult.losses++;
				}
			}
	});

	// Convert to sorted array
	return dates.map(date => ({
		date,
		wins: dailyCounts.get(date)!.wins,
		losses: dailyCounts.get(date)!.losses
	}));
}

function addPoints(pointsScored: number, pointsAllowed:number, i: number, typeMatches: any, userId: number) {
	if (typeMatches[i].winnerId === userId) {
		pointsScored += typeMatches[i].winnerScore;
		pointsAllowed += typeMatches[i].loserScore;
	} else {
		pointsAllowed += typeMatches[i].winnerScore;
		pointsScored += typeMatches[i].loserScore;
	}
	return { pointsScored, pointsAllowed }
}

export async function displayGlobal(root:string){

	let gamesWinSolo = 0;
	let gamesWinLocal = 0;
	let gamesWinTournament = 0;
	let gamesLoseSolo = 0;
	let gamesLoseLocal = 0;
	let gamesLoseTournament = 0;
	let pointsScored = 0;
	let pointsAllowed = 0;

	let userName: string = '';
	let userId: number = 0; // Initialize with a default value
	let localMatches: {id : number, winner: string ; winnerId: number; loser: string; looserId:number ;winnerScore: number; loserScore: number; matchDate: string }[] = [];
	let soloMatches: { id: number , winner: string; loser: string; winnerId : number; looserId : number; winnerScore: number; loserScore: number; matchDate: string }[] = [];
	let tournamentMatches: { id: number , winner: string; loser: string; winnerId : number; looserId : number;  winnerScore: number; loserScore: number; matchDate: string }[] = [];
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
		userId = data.userId || 0;
		for (let i = 0; i < localMatches.length; i++) {
			localMatches[i].winnerId === userId ? gamesWinLocal++ : gamesLoseLocal++;
			({ pointsScored, pointsAllowed } = addPoints(pointsScored, pointsAllowed, i, localMatches, userId));

		}
		for (let i = 0; i < soloMatches.length; i++) {
			soloMatches[i].winnerId === userId ? gamesWinSolo++ : gamesLoseSolo++;
			({ pointsScored, pointsAllowed } = addPoints(pointsScored, pointsAllowed, i, soloMatches, userId));
		}
		for (let i = 0; i < tournamentMatches.length; i++) {
			tournamentMatches[i].winnerId === userId ? gamesWinTournament++ : gamesLoseTournament++;
			({ pointsScored, pointsAllowed } = addPoints(pointsScored, pointsAllowed, i, tournamentMatches, userId));
		}
	});
	const gamesWin = gamesWinSolo + gamesWinLocal + gamesWinTournament;
	const gamesLose = gamesLoseSolo + gamesLoseLocal + gamesLoseTournament;
	const weeklyLocalWin = getDailyWinLoss(localMatches,userId);
	const weeklySoloWin = getDailyWinLoss(soloMatches,userId );
	const weeklyTournamentWin = getDailyWinLoss(tournamentMatches,userId );
	if (gamesWin + gamesLose === 0)
		return;

	const totalMatches = gamesWin + gamesLose;
	const totalGames = document.getElementById('totalGames') as HTMLCanvasElement | null;
	const totalGamesValue = totalGames!.querySelectorAll('p')[1];
	totalGamesValue.textContent = totalMatches.toString();

	const totalWins = document.getElementById('totalWins') as HTMLCanvasElement | null;
	const totalWinsValue = totalWins!.querySelectorAll('p')[1];
	totalWinsValue.textContent = gamesWin.toString();

	const totalLosses = document.getElementById('totalLosses') as HTMLCanvasElement | null;
	const totalLossesValue = totalLosses!.querySelectorAll('p')[1];
	totalLossesValue.textContent = gamesLose.toString();

	const nbPointsScored = document.getElementById('pointsScored') as HTMLCanvasElement | null;
	const pointsScoredValue = nbPointsScored!.querySelectorAll('p')[1];
	pointsScoredValue.textContent = pointsScored.toString();

	const nbPointsAllowed = document.getElementById('pointsAllowed') as HTMLCanvasElement | null;
	const pointsAllowedValue = nbPointsAllowed!.querySelectorAll('p')[1];
	pointsAllowedValue.textContent = pointsAllowed.toString();

	const last7Days = Array.from({ length: 7 }, (_, i) => {
		const date = new Date();
		date.setDate(date.getDate() - i);
		return date.toISOString().split('T')[0];
	}).reverse();

	const winsByDayGlobal = last7Days.map(date => {
		const localResult = weeklyLocalWin.find(result => result.date === date) || { wins: 0, losses: 0 };
		const soloResult = weeklySoloWin.find(result => result.date === date) || { wins: 0, losses: 0 };
		const tournamentResult = weeklyTournamentWin.find(result => result.date === date) || { wins: 0, losses: 0 };
		return localResult.wins + soloResult.wins + tournamentResult.wins;
	});

	const lossesByDayGlobal = last7Days.map(date => {
		const localResult = weeklyLocalWin.find(result => result.date === date) || { wins: 0, losses: 0 };
		const soloResult = weeklySoloWin.find(result => result.date === date) || { wins: 0, losses: 0 };
		const tournamentResult = weeklyTournamentWin.find(result => result.date === date) || { wins: 0, losses: 0 };
		return localResult.losses + soloResult.losses + tournamentResult.losses;
	});

	const barChartCanvas = document.getElementById('globalBarChart') as HTMLCanvasElement | null;
	if (!barChartCanvas) {
		console.error('Canvas for bar chart not found!');
		return;
	}

	if (charts.barChart) {
		charts.barChart.destroy();
	}
	charts.barChart = new Chart(barChartCanvas, {
		type: 'bar',
		data: {
			labels: last7Days,
			datasets: [
				{
					label: 'Wins',
					data: winsByDayGlobal,
					backgroundColor: 'red',
				},
				{
					label: 'Losses',
					data: lossesByDayGlobal,
					backgroundColor: 'blue',
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				x: {
					title: {
						display: true,
						text: 'Date',
					},
				},
				y: {
					title: {
						display: true,
						text: 'Number of Matches',
					},
					beginAtZero: true,
				},
			},
			animation: {
				duration: 1000,
				easing: 'easeOutBounce'
			},
		},
	});


	const global = document.getElementById('globalChart') as HTMLCanvasElement | null;
	if (!global) {
		console.error('Canvas non trouvé !');
		return;
	}
	if (charts.globalPieChart) {
		charts.globalPieChart.destroy();
	}
	charts.globalPieChart = new Chart(global, {
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

	//Local
	const winsByDaylocal = last7Days.map(date => {
		const localResult = weeklyLocalWin.find(result => result.date === date) || { wins: 0, losses: 0 };
		return localResult.wins ;
	});

	const lossesByDaylocal = last7Days.map(date => {
		const localResult = weeklyLocalWin.find(result => result.date === date) || { wins: 0, losses: 0 };
		return localResult.losses;
	});

	const localBarChartCanvas = document.getElementById('localBarChart') as HTMLCanvasElement | null;
	if (!localBarChartCanvas) {
		console.error('Canvas for bar chart not found!');
		return;
	}


	if (charts.localBarChart) {
		charts.localBarChart.destroy();
	}
	charts.localBarChart = new Chart(localBarChartCanvas, {
		type: 'bar',
		data: {
			labels: last7Days,
			datasets: [
				{
					label: 'Wins',
					data: winsByDaylocal,
					backgroundColor: 'red',
				},
				{
					label: 'Losses',
					data: lossesByDaylocal,
					backgroundColor: 'blue',
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				x: {
					title: {
						display: true,
						text: 'Date',
					},
				},
				y: {
					title: {
						display: true,
						text: 'Number of Matches',
					},
					beginAtZero: true,
				},
			},
			animation: {
				duration: 1000,
				easing: 'easeOutBounce'
			},
		},
	});

	const local = document.getElementById('localChart') as HTMLCanvasElement | null;
	if (!local) {
		console.error('Canvas non trouvé !');
		return;
	}
	if (charts.localPieChart) {
		charts.localPieChart.destroy();
	}
	charts.localPieChart = new Chart(local, {
		type: 'doughnut',
		data: {
		labels: ['Wins', 'Losses'],
		datasets: [{
			data: [gamesWinLocal, gamesLoseLocal],
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

	//solo
	const winsByDaysolo = last7Days.map(date => {
		const soloResult = weeklySoloWin.find(result => result.date === date) || { wins: 0, losses: 0 };
		return soloResult.wins ;
	});

	const lossesByDaysolo = last7Days.map(date => {
		const soloResult = weeklySoloWin.find(result => result.date === date) || { wins: 0, losses: 0 };
		return soloResult.losses;
	});

	const soloBarChartCanvas = document.getElementById('soloBarChart') as HTMLCanvasElement | null;
	if (!soloBarChartCanvas) {
		console.error('Canvas for bar chart not found!');
		return;
	}

	if (charts.soloBarChart) {
		charts.soloBarChart.destroy();
	}
	charts.soloBarChart = new Chart(soloBarChartCanvas, {
		type: 'bar',
		data: {
			labels: last7Days,
			datasets: [
				{
					label: 'Wins',
					data: winsByDaysolo,
					backgroundColor: 'red',
				},
				{
					label: 'Losses',
					data: lossesByDaysolo,
					backgroundColor: 'blue',
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				x: {
					title: {
						display: true,
						text: 'Date',
					},
				},
				y: {
					title: {
						display: true,
						text: 'Number of Matches',
					},
					beginAtZero: true,
				},
			},
			animation: {
				duration: 1000,
				easing: 'easeOutBounce'
			},
		},
	});

	const solo = document.getElementById('soloChart') as HTMLCanvasElement | null;
	if (!solo) {
		console.error('Canvas non trouvé !');
		return;
	}
	if (charts.soloPieChart) {
		charts.soloPieChart.destroy();
	}
	charts.soloPieChart = new Chart(solo, {
		type: 'doughnut',
		data: {
		labels: ['Wins', 'Losses'],
		datasets: [{
			data: [gamesWinSolo, gamesLoseSolo],
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

	//tournament
	const winsByDaytournament = last7Days.map(date => {
		const tournamentResult = weeklyTournamentWin.find(result => result.date === date) || { wins: 0, losses: 0 };
		return tournamentResult.wins ;
	});

	const lossesByDaytournament = last7Days.map(date => {
		const tournamentResult = weeklyTournamentWin.find(result => result.date === date) || { wins: 0, losses: 0 };
		return tournamentResult.losses;
	});

	const tournamentBarChartCanvas = document.getElementById('tournamentBarChart') as HTMLCanvasElement | null;
	if (!tournamentBarChartCanvas) {
		console.error('Canvas for bar chart not found!');
		return;
	}
	if (charts.tournamentBarChart) {
		charts.tournamentBarChart.destroy();
	}
	charts.tournamentBarChart = new Chart(tournamentBarChartCanvas, {
		type: 'bar',
		data: {
			labels: last7Days,
			datasets: [
				{
					label: 'Wins',
					data: winsByDaytournament,
					backgroundColor: 'red',
				},
				{
					label: 'Losses',
					data: lossesByDaytournament,
					backgroundColor: 'blue',
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				x: {
					title: {
						display: true,
						text: 'Date',
					},
				},
				y: {
					title: {
						display: true,
						text: 'Number of Matches',
					},
					beginAtZero: true,
				},
			},
			animation: {
				duration: 1000,
				easing: 'easeOutBounce'
			},
		},
	});

	const tournament = document.getElementById('tournamentChart') as HTMLCanvasElement | null;
	if (!tournament) {
		console.error('Canvas non trouvé !');
		return;
	}

	if (charts.tournamentPieChart) {
		charts.tournamentPieChart.destroy();
	}
	charts.tournamentPieChart = new Chart(tournament, {
		type: 'doughnut',
		data: {
		labels: ['Wins', 'Losses'],
		datasets: [{
			data: [gamesWinTournament, gamesLoseTournament],
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
