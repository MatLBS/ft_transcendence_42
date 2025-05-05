import { prisma } from './seed.js';

/**
 * Ajoute un follow entre deux utilisateurs.
 * @param followerId - L'ID de l'utilisateur qui suit.
 * @param followedId - L'ID de l'utilisateur à suivre.
 * @returns Un message indiquant le succès ou l'échec de l'opération.
 */
export async function addFollow(followerId: number, followedId: number): Promise<{ message?: string; ok: boolean }> {
	try {
		// Ajoute la relation de suivi
		await prisma.follow.create({
			data: {
				followerId,
				followedId,
			},
		});

		return {ok: true};
	} catch (error) {
		console.error("Erreur lors de l'ajout du follow :", error);
		return {message: "Une erreur est survenue lors de l'ajout du follow.", ok: false};
	}
}

/**
 * supprime un follow entre deux utilisateurs.
 * @param followerId - L'ID de l'utilisateur qui suit.
 * @param followedId - L'ID de l'utilisateur à suivre.
 * @returns Un message indiquant le succès ou l'échec de l'opération.
 */
export async function removeFollow(followerId: number, followedId: number): Promise<{ message?: string; ok: boolean }> {
	try {
		// Supprime la relation de suivi
		await prisma.follow.delete({
			where: {
				followerId_followedId: {
					followerId: followerId,
					followedId: followedId,
				},
			},
		});

		return { message: "Relation d'amitié supprimée avec succès.", ok: true };
	} catch (error) {
		console.error("Erreur lors de la suppression de la relation d'amitié :", error);
		return { message: "Une erreur est survenue lors de la suppression de la relation d'amitié.", ok: false };
	}
}

type Friend = {
	username: string;
	profilePicture: string | null;
	isOnline: boolean;
};
/**
 * Récupère tous les utilisateurs suivis par un utilisateur.
 * @param followerId - L'ID de l'utilisateur qui suit.
 * @returns Une liste des utilisateurs suivis ou un message d'erreur.
 */
export async function getFollowedUsers(followerId: number): Promise<Friend[]> {
	try {
		const followedUsers = await prisma.follow.findMany({
			where: { followerId },
			include: {
				followed: {
					select: {
						id: true,
						username: true,
						profilePicture: true,
						isOnline: true,
					},
				},
			},
		});
		return followedUsers.map((follow : any) => follow.followed);
	} catch (error) {
		console.error("Erreur lors de la récupération des utilisateurs suivis :", error);
		return [];
	}
}

/**
 * Récupère tous les utilisateurs qui suivent un utilisateur donné.
 * @param followedId - L'ID de l'utilisateur suivi.
 * @returns Une liste des utilisateurs qui suivent l'utilisateur donné ou un message d'erreur.
 */
export async function getFollowers(followedId: number): Promise<Friend[]> {
	try {
		const followers = await prisma.follow.findMany({
			where: { followedId },
			include: {
				follower: {
					select: {
						id: true,
					},
				},
			},
		});
		return followers.map((follow : any) => follow.follower);
	} catch (error) {
		console.error("Erreur lors de la récupération des utilisateurs qui suivent :", error);
		return [];
	}
}

/**
 * Vérifie si deux utilisateurs sont amis en fonction de leurs identifiants.
 *
 * @param userId - L'identifiant de l'utilisateur qui suit potentiellement.
 * @param friendId - L'identifiant de l'utilisateur qui est potentiellement suivi.
 * @returns Une promesse qui résout à `true` si les utilisateurs sont amis, sinon `false`.
 */
export async function isFriend(userId: number, friendId: number): Promise<boolean> {
	try {
		const follow = await prisma.follow.findUnique({
			where: {
				followerId_followedId: {
					followerId: userId,
					followedId: friendId,
				},
			},
		});
		return follow !== null;
	} catch (error) {
		console.error("Erreur lors de la vérification de l'amitié :", error);
		return false;
	}
}
