import { applyLink } from './utils.js';
import { language } from '../main.js';

// Ajoute un gestionnaire d'événements global pour la délégation
const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener('click', async (e: MouseEvent) => {
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
		if (target.tagName === 'SPAN' && target.id === 'expandTournament')  {
			const customOptions = document.getElementById('custom-options');
			if (customOptions) customOptions.classList.toggle('open');
			return;
		}

		// Gestion des clics sur le bouton "Validation"
		if (target.tagName === 'BUTTON' && target.id === 'buttonValidation') {
			const local = await validateLocalGame();
			if (local !== false)
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

function hideDiv(divId: string, buttonId: string, otherDivId?: string) {
	const div = document.getElementById(divId);
	const button = document.getElementById(buttonId);
	const otherDiv = document.getElementById(otherDivId || '');
	if (div) div.classList.toggle('none');
	if (button) button.classList.toggle('none');
	if (otherDiv) otherDiv.classList.toggle('none');
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

async function validateLocalGame() {
	const usernameElement = document.getElementById('username') as HTMLInputElement | null;
	let userLogIn: string | undefined;

	if (!usernameElement) {
		alert('Username input not found.');
		return false;
	}
	const player2 = usernameElement.value;

	await fetch('/getUser', {
		method: 'GET',
		credentials: 'include',
	})
		.then(async (response) => {
			const data = await response.json();
			userLogIn = data.user.username as string;
		})

	if (player2.trim() === '') {
		alert(`Player has an empty name. Please fill in the field.`);
		return false;
	}
	else if (player2.trim() === userLogIn) {
		alert(`Player 2 can't have the same username as the user log in.`);
		return false;
	}
	
	await fetch('/createLocal', {
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

	gameSettings.addEventListener('click', async (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		const customDefault = document.getElementById('custom-default');
		const hiddenValue = document.getElementById('hiddenValue') as HTMLInputElement | null;
		const playerNames = document.getElementById('playerNames');
		const divButton = document.getElementById('divButton');
		let jsonLanguage;
		await fetch('/languages', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ language }),
		})
			.then(async (response) => {
				jsonLanguage = await response.json();
			})
			.catch((error: unknown) => {
				console.error('Erreur lors de la récupération du contenu:', error);
			});
		if (target.matches('#custom-options li')) {

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

				playerContainer.innerHTML += `<span>${jsonLanguage!.tournament.player} ${i + 1}</span>`;
				const tempDiv = document.createElement('div');
				tempDiv.className = 'flex justify-center align-center w-full';
				tempDiv.innerHTML += `<input type="text" id="playerName" name="playerName" placeholder="${jsonLanguage!.tournament.enter}..." class="border-2 border-gray-500 w-[50%] rounded-full">`;
				
				playerContainer.appendChild(tempDiv);
				playerNames.appendChild(playerContainer);
			}

			// Ajouter un bouton de validation
			const validateButton = document.createElement('button');
			validateButton.textContent = jsonLanguage!.tournament.validate;
			validateButton.id = 'submit-button';
			validateButton.className = 'bg-blue-500 text-white px-4 py-2 rounded-lg mt-4';				

			const existingButton = divButton.querySelector('button');
			if (existingButton)
				divButton.removeChild(existingButton);

			divButton.appendChild(validateButton);
		}

		if (target.matches('#submit-button')) {
			if ((target as HTMLButtonElement).dataset.processing === 'true')
				return; // Éviter le traitement multiple
			
			(target as HTMLButtonElement).dataset.processing = 'true';
			const submitButton = target as HTMLButtonElement;
			submitButton.disabled = true;
			
			const playerInputs = playerNames!.querySelectorAll('#playerName');
			const playerData: string[] = [];
			playerInputs.forEach((input) => {
				playerData.push((input as HTMLInputElement).value);
			});

			let userLogIn :string | undefined;
			await fetch('/getUser', {
				method: 'GET',
				credentials: 'include',
			})
				.then(async (response) => {
					const data = await response.json();
					userLogIn = data.user.username as string;
				})
			
			for (let i = 0; i < playerData.length; i++) {
				if (playerData[i].trim() === '') {
					alert(`Player ${i + 1} has an empty name. Please fill in all fields.`);
					submitButton.disabled = false;
					(target as HTMLButtonElement).dataset.processing = 'false';
					return;
				}
				if (playerData[i].trim() === userLogIn) {
					alert(`Player ${i + 1} can't have the same username as the user log in.`);
					submitButton.disabled = false;
					(target as HTMLButtonElement).dataset.processing = 'false';
					return;
				}
			}

			const uniquePlayers = new Set(playerData.map(name => name.trim()));
			if (uniquePlayers.size !== playerData.length) {
				alert('Duplicate player names are not allowed. Please ensure all names are unique.');
				submitButton.disabled = false;
				(target as HTMLButtonElement).dataset.processing = 'false';
				return;
			}
			
			fetch('/createTournament', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ playerData }),
			})
			.then(async (response) => {
				hideDiv("custom-select", "divButton", "playerNames");
				const event = new CustomEvent('eventNextMatch');
				window.dispatchEvent(event);
			})
			.finally(() => {
				submitButton.disabled = false;
				(target as HTMLButtonElement).dataset.processing = 'false';
			});
		}

	});
};

const buttonNextMatch = document.getElementById('buttonNextMatch');

window.addEventListener('eventNextMatch', async (event) => {
	let data;
	await fetch('/getNextMatchTournament', {
		method: 'GET',
		credentials: 'include',
	})
	.then(async (response) => {
		data = await response.json();
	})
	
	const divMessage = document.createElement('div');
	divMessage.innerHTML = data?.[0] + " will play against " + data?.[1];
	const divNextMatchButton = document.getElementById('divNextMatchButton');
	if (divNextMatchButton?.firstChild)
		divNextMatchButton.removeChild(divNextMatchButton.firstChild);
	if (divNextMatchButton)
		divNextMatchButton.insertBefore(divMessage, divNextMatchButton.firstChild);
	divNextMatchButton?.classList.remove('hidden');
});

buttonNextMatch?.addEventListener('click', () => {
	const divNextMatchButton = document.getElementById('divNextMatchButton');
	divNextMatchButton?.classList.toggle('open');
});