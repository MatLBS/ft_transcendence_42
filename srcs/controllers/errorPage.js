export const getErrorPage = (req, reply) => {
	console.log("error page");
	return reply.redirect("/404");
};
