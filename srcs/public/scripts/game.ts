const local = document.getElementById('local');
const multiplayer = document.getElementById('multiplayer');
const tournament = document.getElementById('tournament');
const gameSettings = document.getElementById('gameSettings');

if (!local || !multiplayer || !tournament || !gameSettings)
	throw new Error('Element not found');

local.addEventListener('click', async () => {
	await fetch('/local', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(""),
	})
	.then(async (response) => {
		const data = await response.json();
		gameSettings.innerHTML = data.content;
		const linkElement = document.createElement('link');
		linkElement.rel = 'stylesheet';
		linkElement.href = "public/style/local.css";
		linkElement.id = "css";
		document.head.appendChild(linkElement);
	})


	const buttonValidation = document.getElementById('buttonValidation')

	if (!buttonValidation)
		throw new Error('Element not found');

	buttonValidation.addEventListener('click', function() {
		const usernameElement = document.getElementById('username') as HTMLInputElement | null;

		const player2 = usernameElement?.value || '';

		if (player2 === "") {
			alert(`Player has an empty name. Please fill in the field.`);
			return;
		}

		fetch('/createLocal', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ player2 }),
		})
	})

});

// multiplayer.addEventListener('click', async () => {});






tournament.addEventListener('click', async () => {
	await fetch('/tournament', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(""),
	})
	.then(async (response) => {
		const data = await response.json();
		gameSettings.innerHTML = data.content;
		const linkElement = document.createElement('link');
		linkElement.rel = 'stylesheet';
		linkElement.href = "public/style/tournament.css";
		linkElement.id = "css";
		document.head.appendChild(linkElement);
	})

	const customSelecter = document.getElementById('custom-select')
	const customOptions = document.getElementById('custom-options')
	const customOptionsItems = document.querySelectorAll('#custom-options li')
	const customDefault = document.getElementById('custom-default')
	const hiddenValue = document.getElementById('hiddenValue') as HTMLInputElement | null;
	const playerNames = document.getElementById('playerNames')
	const divButton = document.getElementById('divButton')


	if(!customSelecter || !customOptions || !divButton || !customOptionsItems || !customDefault || !hiddenValue || !playerNames)
		throw new Error('Element not found');
	customSelecter.addEventListener('click', () => {
		customOptions.classList.toggle('open');
	});

	customOptionsItems.forEach(option => {
		option.addEventListener('click', function() {
			customDefault.innerHTML = `
			${option.textContent}
			<span class="material-icons">expand_more</span>`
			hiddenValue.value = option.getAttribute('data-value') || '';

			playerNames.innerHTML = '';

			const value: number = parseInt(hiddenValue.value || '0');

			for (let i = 0; i < value; i++) {
				const playerContainer = document.createElement('div');
				playerContainer.className = 'flex flex-col border-2 border-red-500 m-3 text-center';

				playerContainer.innerHTML += `<span>Player ${i + 1}</span>`;
				playerContainer.innerHTML += `<input type="text" id="playerName" name="playerName" placeholder="enter a name..." class="border-2 border-gray-500 w-100 rounded-lg">`;

				playerNames.appendChild(playerContainer);
			}

			// Ajouter un bouton de validation
			const validateButton = document.createElement('button');
			validateButton.textContent = 'Validate';
			validateButton.className = 'bg-blue-500 text-white px-4 py-2 rounded-lg mt-4';
			validateButton.addEventListener('click', () => {
				const playerInputs = playerNames.querySelectorAll("#playerName");
				const playerData: string[] = [];

				playerInputs.forEach(input => {
					playerData.push((input as HTMLInputElement).value);
				});

				for (let i = 0; i < playerData.length; i++) {
					if (playerData[i].trim() === '') {
						alert(`Player ${i + 1} has an empty name. Please fill in all fields.`);
						return; // Arrête la validation si une valeur est vide
					}
				}

				// console.log('Player Names:', playerData);
				// alert(`Player Names: ${playerData.join(', ')}`);

				fetch('/createTournament', {
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ playerData }),
				})
			});

			const existingButton = divButton.querySelector('button');
			if (existingButton) {
				divButton.removeChild(existingButton);
			}

			divButton.appendChild(validateButton);
		})
	});
});

