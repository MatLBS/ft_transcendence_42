import { Chart } from 'chart.js';

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
    const ctx = document.getElementById('global_graphs') as HTMLCanvasElement | null;
    
    new Chart(ctx!, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
        }]
    },
    options: {
        scales: {
        y: {
            beginAtZero: true
        }
        }
    }
    });
}



displayMatches();
displayGraphs();