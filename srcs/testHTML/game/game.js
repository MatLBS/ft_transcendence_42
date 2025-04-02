// const local = document.getElementById('local');
// const multiplayer = document.getElementById('multiplayer');
// const tournament = document.getElementById('tournament');
// const gameSettings = document.getElementById('gameSettings');


// local.addEventListener('click', () => {});

// multiplayer.addEventListener('click', () => {

	
// });

// tournament.addEventListener('click', () => {});

const customSelecter = document.getElementById('custom-select')
	const customOptions = document.getElementById('custom-options')
	const customOptionsItems = document.querySelectorAll('#custom-options li')
	const customDefault = document.getElementById('custom-default')
	const hiddenValue = document.getElementById('hiddenValue')
	const playerNames = document.getElementById('playerNames')

	customSelecter.addEventListener('click', () => {
		customOptions.classList.toggle('open');
	});

	customOptionsItems.forEach(option => {

		option.addEventListener('click', function() {
			customDefault.innerHTML = `
			${option.textContent}
			<span class="material-icons">expand_more</span>`
			hiddenValue.value = option.getAttribute('data-value');
			console.log(hiddenValue.value);

			playerNames.innerHTML = '';
					
			for (let i = 0; i < hiddenValue.value; i++) {
				const playerContainer = document.createElement('div');
				playerContainer.className = 'flex flex-col border-2 border-red-500 m-3 text-center';

				playerContainer.innerHTML += `<span>Player ${i + 1}</span>`;
				playerContainer.innerHTML += `<input type="text" id="playerName" name="playerName" placeholder="enter a name..." class="border-2 border-gray-500 w-100 rounded-lg">`;
			
				playerNames.appendChild(playerContainer);
			}
		})
	});