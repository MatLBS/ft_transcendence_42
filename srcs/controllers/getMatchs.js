import { getLocalMatches, getSoloMatches, getTournamentMatches, findUserById } from '../dist/prisma/seed.js';
import { getExternalUser } from './getUser.js';
import { authenticateUser } from "./tokens.js";

export const getMatchsResults = async (req, reply) => {
	let matchs = {};
	const response = await authenticateUser(req);
	if (response.status !== 200)
		return;
	const userId = response.user.id ;
	const userInfos = await findUserById(userId);
	const user = userInfos.username;
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
	const userId = response.id;
	const userInfos = await findUserById(userId);
	const user = userInfos.username;
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