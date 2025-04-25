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


export async function displayMatches(root:string) {
	const match__history = document.getElementById('match__history') as HTMLInputElement | null;


	await fetch(root, {
		method: 'GET',
		credentials: 'include',
	})
	.then(async (response) => {
		const data = await response.json();
		const localMatches = data.matchs.local;
		const soloMatches = data.matchs.solo;
		const tournamentMatches = data.matchs.tournament;

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

interface MatchData {
	id: number;
	loser: string;
	loserScore: number;
	matchDate: string;
	winner: string;
	winnerScore: number;
  }
  
  interface DailyResult {
	date: string;
	wins: number;
	losses: number;
}

function getDailyWinLoss(localMatches: MatchData[], username: string): DailyResult[] {
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
		if (match.winner === username) {
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

export async function displayGlobal(root:string){

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
	const weeklyLocalWin = getDailyWinLoss(localMatches,userName );
	const weeklySoloWin = getDailyWinLoss(soloMatches,userName );
	const weeklyTournamentWin = getDailyWinLoss(tournamentMatches,userName );
	if (gamesWin + gamesLose === 0)
		return;
	
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
