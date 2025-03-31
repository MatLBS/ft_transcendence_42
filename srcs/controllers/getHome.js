export const getHome = async (req, reply) => {
	return reply.view("index.ejs");
}
