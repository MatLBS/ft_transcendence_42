import { getLocalMatches, getSoloMatches, getTournamentMatches } from '../dist/prisma/seed.js';
import { getExternalUser } from './getUser.js';
import { authenticateUser } from "./tokens.js";

export const getMatchsResults = async (req, reply) => {
	let matchs = {};
	const response = await authenticateUser(req);
	if (response.status !== 200)
		return;
	const user = response.user.username;
	try {
		const localMatchs = await getLocalMatches(user);
		matchs['local'] = localMatchs;
		const soloMatchs = await getSoloMatches(user);
		matchs['solo'] = soloMatchs;
		const tournamentMatchs = await getTournamentMatches(user);
		matchs['tournament'] = tournamentMatchs;
		reply.send({matchs, user});
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
	try {
		const localMatchs = await getLocalMatches(user);
		matchs['local'] = localMatchs;
		const soloMatchs = await getSoloMatches(user);
		matchs['solo'] = soloMatchs;
		const tournamentMatchs = await getTournamentMatches(user);
		matchs['tournament'] = tournamentMatchs;
		reply.send({matchs, user});
	} catch (error) {
		return reply.send({message: error.message});
	}
}