// pour gerer les url directe
export const getPage = async (req, reply) => {
	if (req.params.page.endsWith('.js') || req.params.page.endsWith('.css'))
		return reply.sendFile(req.params.page);

	return reply.view("index.ejs");
}
