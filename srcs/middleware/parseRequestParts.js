import path from 'path';

export const parseRequestParts = async (req, reply) => {
	let fields = {};
	let fileBuffer = null, fileName = null;

	const parts = req.parts();
	for await (const part of parts) {
		if (part.file) {
			if (!part.mimetype.startsWith('image/')) {
				reply.send({ message: 'Invalid file type. Only images are allowed.' });
				return null;
			}
			// Si c'est un fichier, le sauvegarder
			const originalExtension = path.extname(part.filename);
			fileName = `temp_${Date.now()}${originalExtension}`;
			fileBuffer = await part.toBuffer();
		} else {
			// Si c'est un champ, l'ajouter à fields
			fields[part.fieldname] = part.value;
		}
	}
	return { fields, fileBuffer, fileName };
};
