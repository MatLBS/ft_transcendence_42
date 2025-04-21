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

    const global = document.getElementById('globalChart');
    if (!global) {
        console.error('Canvas non trouvé !');
        return;
    }
    new Chart(global, {
        type: 'doughnut',
        data: {
        labels: ['Win', 'Lose'],
        datasets: [{
            data: [gamesWin, gamesLose],
            backgroundColor: ['red', 'blue']
        }]
        }
    });

    const local = document.getElementById('localChart');
    if (!local) {
        console.error('Canvas non trouvé !');
        return;
    }
    new Chart(local, {
        type: 'doughnut',
        data: {
        labels: ['Win', 'Lose'],
        datasets: [{
            data: [gamesWinLocal, gamesLoseLocal],
            backgroundColor: ['red', 'blue']
        }]
        }
    });

    const solo = document.getElementById('soloChart');
    if (!solo) {
        console.error('Canvas non trouvé !');
        return;
    }
    new Chart(solo, {
        type: 'doughnut',
        data: {
        labels: ['Win', 'Lose'],
        datasets: [{
            data: [gamesWinSolo, gamesLoseSolo],
            backgroundColor: ['red', 'blue']
        }]
        }
    });

    const tournament = document.getElementById('tournamentChart');
    if (!tournament) {
        console.error('Canvas non trouvé !');
        return;
    }
    new Chart(tournament, {
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

// Ajoute un gestionnaire d'événements global pour la délégation
const appDiv = document.getElementById("app");
if (appDiv) {
    appDiv.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        console.log(target.tagName)
        console.log(target.id)


        // Gestion des clics sur le bouton "Custom Select"
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

    });
}



displayMatches();
displayGraphs();