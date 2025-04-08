const customSelecter = document.getElementById('custom-select')
	const customOptions = document.getElementById('custom-options')
	const customOptionsItems = document.querySelectorAll('#custom-options li')
	const customDefault = document.getElementById('custom-default')
	const hiddenValue = document.getElementById('hiddenValue');
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

			const value = parseInt(hiddenValue.value || '0');
					
			for (let i = 0; i < value; i++) {
				const playerContainer = document.createElement('div');
				playerContainer.className = 'flex flex-col border-2 border-red-500 my-5 mx-3 text-center w-[40%]';

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
			validateButton.className = 'bg-blue-500 text-white px-4 py-2 rounded-lg mt-4';
			validateButton.addEventListener('click', () => {
				const playerInputs = playerNames.querySelectorAll("#playerName");
				const playerData = [];

				playerInputs.forEach(input => {
					playerData.push(input.value);
				});

				for (let i = 0; i < playerData.length; i++) {
					if (playerData[i].trim() === '') {
						alert(`Player ${i + 1} has an empty name. Please fill in all fields.`);
						return; // Arrête la validation si une valeur est vide
					}
				}

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