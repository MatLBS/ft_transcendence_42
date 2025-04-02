
export const logout = async (request, reply) => {
	reply
		.clearCookie('access_token')
		.clearCookie('refresh_token')
		.send({ status: 200 });
};
