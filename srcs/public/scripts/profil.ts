import { text } from 'stream/consumers';
import { recvContent } from '../main.js';
import { displayGlobal, displayMatches, charts} from './stats.js';
/** @global */
declare var Chart: any;
let targetMessage: string;
let ws: WebSocket;
let wsTarget: WebSocket;


const appDiv = document.getElementById("app");
if (appDiv) {
	appDiv.addEventListener("click", (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		if (target.closest("button.remove-friend")) {
			const username = target.getAttribute("data-username");
			if (username) {
				removeFriends(username);
			}
		}
		if (target.closest('#custom-select'))  {
			const customOptions = document.getElementById('custom-options');
			if (customOptions) customOptions.classList.toggle('open');
			return;
		}

		if (target.tagName === 'SPAN' && target.id === 'global') {
			const divGlobal = document.getElementById('divGlobal');
			if (divGlobal)
			{
				divGlobal.classList.toggle('none');
				charts.globalPieChart.reset();
				charts.globalPieChart.update();
				charts.barChart.reset()
				charts.barChart.update();
			}
			return;
		}
		if (target.tagName === 'SPAN' && target.id === 'local') {
			const divLocal = document.getElementById('divLocal');
			if (divLocal)
			{
				divLocal.classList.toggle('openStats');
				charts.localBarChart.reset();
				charts.localBarChart.update();
				charts.localPieChart.reset();
				charts.localPieChart.update();
			}
			return;
		}
		if (target.tagName === 'SPAN' && target.id === 'solo') {
			const divSolo = document.getElementById('divSolo');
			if (divSolo)
			{
				divSolo.classList.toggle('openStats');
				charts.soloBarChart.reset();
				charts.soloBarChart.update();
				charts.soloPieChart.reset();
				charts.soloPieChart.update();
			}
			return;
		}
		if (target.tagName === 'SPAN' && target.id === 'tournament') {
			const divTournament = document.getElementById('divTournament');
			if (divTournament)
			{
				divTournament.classList.toggle('openStats');
				charts.tournamentBarChart.reset();
				charts.tournamentBarChart.update();
				charts.tournamentPieChart.reset();
				charts.tournamentPieChart.update();
			}
			return;
		}
		if (target.tagName === 'BUTTON' && target.id === 'open-friends') {
			const friends = document.getElementById('container');
			if (friends) friends.classList.toggle('open-friends');
			return;
		}
		if (target.tagName === 'BUTTON' && target.id === 'close-friends') {
			const friends = document.getElementById('container');
			if (friends) friends.classList.remove('open-friends');
			return;
		}
		if (target.tagName === 'SPAN' && target.id === 'openChat') {
			const chat = document.getElementById('liveChat');
			if (chat) chat.classList.toggle('openLiveCHat');
			handleMessages();
		}
		if (target.tagName === 'BUTTON' && target.id === 'close-chat') {
			const chat = document.getElementById('liveChat');
			if (chat) chat.classList.toggle('openLiveCHat');
			return;
		}
		if (target.tagName === 'BUTTON' && target.id === 'send-chat') {
			const textChat = document.getElementById('text-chat') as HTMLInputElement;
			sendMessage(textChat!.value)
		}
	});
}

interface Message {
	content: string
	conversationId: number
	createdAt: Date
	id: number
	senderId: number
  }

async function sendMessage(newMessage: string | null) {
	if (newMessage?.trim().length === 0 || !newMessage || !targetMessage)
		return
	await fetch('/enterNewMessage', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ newMessage, targetMessage }),
	})
}

async function handleMessages() {
	document.querySelectorAll('.chat-card').forEach(card => {
		card.addEventListener('click', async () => {
			const h2Element = card.querySelector('h2');
			targetMessage = h2Element ? h2Element.textContent || '' : '';
			let messages: Message[] = [];
			await fetch('/getAllMessages', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetMessage }),
			})
				.then(async (response) => {
					messages = await response.json();
				})

				const emptyConv = document.querySelector('#empty-conv');
				if (!messages || messages.length === 0) {
					emptyConv!.innerHTML = 'You don\'t have a message for now';
				} else {
					emptyConv!.innerHTML = ''
					const descending = messages.sort(
						(a: Message, b: Message) => new Date (a.createdAt).getTime() - new Date (b.createdAt).getTime()
					);
					displayMessages(descending)
				}

				wsTarget = new WebSocket(`ws://localhost:3000/wsMessages/${targetMessage}`);
				wsTarget.onmessage = (event) => {
					emptyConv!.innerHTML = '';
					const data = JSON.parse(event.data);
					if (data.newMessage && data.userLogInId && data.targetId && data.actualUser) {
						interface MessageSocket {
							content: string
							senderId: number
							}
						const textChat = document.getElementById('text-chat') as HTMLInputElement;
						const container = document.querySelector('.messages-chat');
						const newMessage: MessageSocket = {
							content: data.newMessage,
							senderId: data.userLogInId,
						};
						const msgDiv = document.createElement('div');
						msgDiv.classList.add('message');
						newMessage!.senderId === data.actualUser ? msgDiv.classList.add('sent') : msgDiv.classList.add('received');
						msgDiv.textContent = newMessage!.content;
						container!.appendChild(msgDiv);
						textChat.value = '';
					}
				}

		});
	});
}

async function displayMessages(descending: Array<Message>) {
	let userId;
	await fetch('/getUserId', {
		method: 'GET',
		credentials: 'include',
	})
		.then(async (response) => {
			const data = await response.json();
			userId = data.userId as number;
		})
	const container = document.querySelector('.messages-chat');
	container!.innerHTML = '';
	for (let i = 0; i < descending.length; ++i) {
		const msgDiv = document.createElement('div');
		msgDiv.classList.add('message');
		descending[i].senderId === userId ? msgDiv.classList.add('sent') : msgDiv.classList.add('received');
		msgDiv.textContent = descending[i].content;
		container!.appendChild(msgDiv);
	}
}

export async function removeFriends(username: string) {
	const response = await fetch(`/deleteFriends/${username}`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = await response.json();
	alert(data.message);
	recvContent(`/profil`);
}

export async function handleStatus() {
	ws = new WebSocket('ws://localhost:3000/ws');

	ws.onmessage = (event) => {
		const data = JSON.parse(event.data);
		if (data.status && data.friendId) {
			const imgStatusElement = document.querySelector(`.status[data-id="${data.friendId}"]`);
			const textStatusElement = document.querySelector(`.sub-text[data-id="${data.friendId}"]`);
			if (imgStatusElement && textStatusElement) {
				textStatusElement.textContent = data.status === 'online' ? 'En ligne' : 'Hors ligne';
				imgStatusElement.className = `status ${data.status}`;
			}
		}
	}
}



window.addEventListener("scroll", () => {
	const button = document.getElementById("open-friends");
		if (!button) return;
		const threshold = 120;
	if (window.scrollY > threshold) {
			button.classList.add("btn-fix");
			button.classList.remove("btn-abs");
		} else {
			button.classList.remove("btn-fix");
			button.classList.add("btn-abs");
		}
});

window.addEventListener('profil', async (event: Event) => {
	await displayMatches("getMatchsResults");
	await displayGlobal("getMatchsResults");
	await handleStatus();
});

await displayMatches("getMatchsResults");
await displayGlobal("getMatchsResults");
await handleStatus();