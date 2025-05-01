import path from 'path';

export const parseRequestParts = async (req, reply) => {
	let fields = {};
	let fileBufferProfil = null, fileBufferBg = null, fileProfil = null, fileBg = null;

	const parts = req.parts();
	for await (const part of parts) {
		if (part.file) {
			if (!part.mimetype.startsWith('image/')) {
				reply.send({ message: 'Invalid file type. Only images are allowed.' });
				return null;
			}
			// Si c'est un fichier, le sauvegarder
			const originalExtension = path.extname(part.filename);
			if (part.fieldname === "bg_picture") {
				fileBg = `temp_${Date.now()}${originalExtension}`;
				fileBufferBg = await part.toBuffer();
			} else {
				fileProfil = `temp_${Date.now()}${originalExtension}`;
				fileBufferProfil = await part.toBuffer();
			}
		} else {
			// Si c'est un champ, l'ajouter à fields
			fields[part.fieldname] = part.value;
		}
	}
	return { fields, fileBufferProfil, fileProfil, fileBufferBg, fileBg };
};
