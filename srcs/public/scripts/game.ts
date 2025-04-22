import { applyLink } from './utils.js';

// Ajoute un gestionnaire d'événements global pour la délégation
const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener('click', (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		// Gestion des liens dynamiques pour les éléments avec la classe "my"
		applyLink(target, e);

		// Gestion des clics sur le bouton "Tournament"
		if (target.tagName === 'DIV' && target.id === 'tournament') {
			const existingPongScript = document.getElementById('game');
			if (existingPongScript) {
				// Stop the script before removing it
				const stopEvent = new Event('stop');
				existingPongScript.dispatchEvent(stopEvent);

				existingPongScript.remove();
			}
			tournamentClick();
			return;
		}

		// Gestion des clics sur le bouton "Local"
		if (target.tagName === 'DIV' && target.id === 'local') {
			const existingPongScript = document.getElementById('game');
			if (existingPongScript) {
				// Stop the script before removing it
				console.log("going to stop");
				const stopEvent = new Event('stop');
				existingPongScript.dispatchEvent(stopEvent);

				existingPongScript.remove();
			}
			localClick();
			return;
		}

		// Gestion des clics sur le bouton "Solo"
		if (target.tagName === 'DIV' && target.id === 'solo') {
			const existingPongScript = document.getElementById('game');
			if (existingPongScript) {
				// Stop the script before removing it
				console.log("going to stop");
				const stopEvent = new Event('stop');
				existingPongScript.dispatchEvent(stopEvent);

				existingPongScript.remove();
			}
			soloClick();
			return;
		}

		// Gestion des clics sur le bouton "Custom Select"
		if (target.closest('#custom-select'))  {
			const customOptions = document.getElementById('custom-options');
			if (customOptions) customOptions.classList.toggle('open');
			return;
		}

		// Gestion des clics sur le bouton "Validation"
		if (target.tagName === 'BUTTON' && target.id === 'buttonValidation') {
			validateLocalGame();
			hideDiv("divLocal", "buttonValidation");
			return;
		}

		if (target.tagName === 'BUTTON' && target.id === 'soloButton') {
			validateSoloGame();
			hideDiv("divSolo", "soloButton");
			return;
		}
		if(target.tagName === 'BUTTON' && target.id ==='buttonNextMatch')
		{
			const divNextMatchButton = document.getElementById('divNextMatchButton');
			divNextMatchButton?.classList.add('hidden');
		}
	});
}

function hideDiv(divId: string, buttonId: string) {
	const div = document.getElementById(divId);
	const button = document.getElementById(buttonId);
	if (div) div.classList.toggle('none');
	if (button) button.classList.toggle('none');
	return;
}

async function localClick() {
	await fetch('/local', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(''),
	})
		.then(async (response) => {
			const data = await response.json();
			const gameSettings = document.getElementById('gameSettings');
			if (gameSettings) gameSettings.innerHTML = data.content;

			// Ajoute le fichier CSS pour le mode local
			const linkElement = document.createElement('link');
			linkElement.rel = 'stylesheet';
			linkElement.href = 'public/style/local.css';
			linkElement.id = 'css';
			document.head.appendChild(linkElement);
		});
}

function validateLocalGame() {
	const usernameElement = document.getElementById('username') as HTMLInputElement | null;

	if (!usernameElement) {
		alert('Username input not found.');
		return;
	}

	const player2 = usernameElement.value;

	if (player2.trim() === '') {
		alert(`Player has an empty name. Please fill in the field.`);
		return;
	}
	
	fetch('/createLocal', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ player2 }),
	});
}

async function soloClick() {
	await fetch('/solo', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(''),
	})
		.then(async (response) => {
			const data = await response.json();
			const gameSettings = document.getElementById('gameSettings');
			if (gameSettings) gameSettings.innerHTML = data.content;

			// Ajoute le fichier CSS pour le mode local
			const linkElement = document.createElement('link');
			linkElement.rel = 'stylesheet';
			linkElement.href = 'public/style/local.css';
			linkElement.id = 'css';
			document.head.appendChild(linkElement);
		});
}

function validateSoloGame() {
	
	/* const scriptElement = document.createElement('script');
	scriptElement.type = 'module';
	scriptElement.src = "dist/srcs/public/scripts/pong.js"
	scriptElement.id ='game';
	document.body.appendChild(scriptElement); */

	fetch('/createSolo', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({  }),
	});
}


async function tournamentClick() {
	await fetch('/tournament', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(''),
	})
		.then(async (response) => {
			const data = await response.json();
			const gameSettings = document.getElementById('gameSettings');
			if (gameSettings) gameSettings.innerHTML = data.content;

			// Ajoute le fichier CSS pour le mode tournoi
			const linkElement = document.createElement('link');
			linkElement.rel = 'stylesheet';
			linkElement.href = 'public/style/tournament.css';
			linkElement.id = 'css';
			document.head.appendChild(linkElement);

			// Initialise le sélecteur personnalisé après le chargement du contenu
			initCustomSelect();
		});
}


function initCustomSelect() {
	const gameSettings = document.getElementById('gameSettings');

	if (!gameSettings) {
		console.error('gameSettings for custom select are missing.');
		return;
	}

	gameSettings.addEventListener('click', (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		if (target.matches('#custom-options li')) {
			const customDefault = document.getElementById('custom-default');
			const hiddenValue = document.getElementById('hiddenValue') as HTMLInputElement | null;
			const playerNames = document.getElementById('playerNames');
			const divButton = document.getElementById('divButton');

			if (!customDefault || !hiddenValue || !playerNames || !divButton) {
				console.error('One or more elements for custom select are missing.');
				return;
			}

			customDefault.innerHTML = `
			${target.textContent}
			<span class="material-icons pl-5">expand_more</span>`;
			hiddenValue.value = target.getAttribute('data-value') || '';

			playerNames.innerHTML = '';

			const value: number = parseInt(hiddenValue.value || '0');

			for (let i = 0; i < value; i++) {
				const playerContainer = document.createElement('div');
				playerContainer.className = 'flex flex-col my-5 mx-3 text-center w-[40%]';

				playerContainer.innerHTML += `<span>Player ${i + 1}</span>`;
				const tempDiv = document.createElement('div');
				tempDiv.className = 'flex justify-center align-center w-full';
				tempDiv.innerHTML += `<input type="text" id="playerName" name="playerName" placeholder="enter a name..." class="border-2 border-gray-500 w-[50%] rounded-full">`;
				
				playerContainer.appendChild(tempDiv);
				playerNames.appendChild(playerContainer);
			}

			// Ajouter un bouton de validation
			const validateButton = document.createElement('button');
			validateButton.textContent = 'Validate';
			validateButton.id = 'submit-button';
			validateButton.className = 'bg-blue-500 text-white px-4 py-2 rounded-lg mt-4';

			gameSettings.addEventListener('click', async (e: MouseEvent) => {
				const target = e.target as HTMLElement;
				if (target.matches('#submit-button')) {
					const playerInputs = playerNames.querySelectorAll('#playerName');
					const playerData: string[] = [];

					playerInputs.forEach((input) => {
						playerData.push((input as HTMLInputElement).value);
					});

					for (let i = 0; i < playerData.length; i++) {
						if (playerData[i].trim() === '') {
							alert(`Player ${i + 1} has an empty name. Please fill in all fields.`);
							return;
						}
					}

					await fetch('/createTournament', {
						method: 'POST',
						credentials: 'include',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ playerData }),
					});
					// await fetch('/getNextMatchTournament', {
					// 	method: 'GET',
					// 	credentials: 'include',
					// })
					// 	.then(async (response) => {
					// 		const data = await response.json();
					// 		console.log("data = ", data);
					// 	})
				}
			});

			const existingButton = divButton.querySelector('button');
			if (existingButton) {
				divButton.removeChild(existingButton);
			}

			divButton.appendChild(validateButton);
		}
	
	});
};

const buttonNextMatch = document.getElementById('buttonNextMatch');

window.addEventListener('eventNextMatch', () => {
	console.log ("receive event");
	const divNextMatchButton = document.getElementById('divNextMatchButton');
	divNextMatchButton?.classList.remove('hidden');
});

buttonNextMatch?.addEventListener('click', () => {
	const divNextMatchButton = document.getElementById('divNextMatchButton');
	divNextMatchButton?.classList.toggle('open');
});