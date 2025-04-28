import { getLocalMatches, getSoloMatches, getTournamentMatches } from '../dist/prisma/seed.js';
import { getExternalUser } from './getUser.js';
import { authenticateUser } from "./tokens.js";

export const getMatchsResults = async (req, reply) => {
	let matchs = {};
	const response = await authenticateUser(req);
	if (response.status !== 200)
		return;
	const user = response.user.username;
	const userId = response.user.id ;
	try {
		const localMatchs = await getLocalMatches(userId);
		matchs['local'] = localMatchs;
		const soloMatchs = await getSoloMatches(userId);
		matchs['solo'] = soloMatchs;
		const tournamentMatchs = await getTournamentMatches(userId);
		matchs['tournament'] = tournamentMatchs;
		reply.send({matchs, user, userId});
	} catch (error) {
		return reply.send({message: error.message});
	}
}

export const getExternalMatchsResults = async (req, reply) => {
	let matchs = {};
	const response = await getExternalUser(req);
	if (response.status !== 200)
		return;
	const user = response.username;
	const userId = response.id;
	try {
		const localMatchs = await getLocalMatches(userId);
		matchs['local'] = localMatchs;
		const soloMatchs = await getSoloMatches(userId);
		matchs['solo'] = soloMatchs;
		const tournamentMatchs = await getTournamentMatches(userId);
		matchs['tournament'] = tournamentMatchs;
		reply.send({matchs, user, userId});
	} catch (error) {
		return reply.send({message: error.message});
	}
}