import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateAccessToken = (user) => {
	return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '15m' });
};


export const generateRefreshToken = (user) => {
	return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const authenticateUser = async (req) => {
	const token = req.cookies.access_token;
	if (!token) {
		return { status: 401, user: null };
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		return { status: 200, user: req.user };
	} catch (err) {
		return { status: 403, user: null };
	}
};
