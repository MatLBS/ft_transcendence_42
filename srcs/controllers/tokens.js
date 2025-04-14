import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateAccessToken = (user, google) => {
	return jwt.sign({ id: user.id, username: user.username, google: google }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (user, google) => {
	return jwt.sign({ id: user.id, username: user.username, google: google }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
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
		return refresh(req);
	}
};


export const refresh = async (req) => {
	const refreshToken = req.cookies.refresh_token;
	if (!refreshToken) {
		return { status: 401, user: null };
	}
	try {
		const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
		const newAccessToken = generateAccessToken(user, user.google);

		const decoded = jwt.verify(newAccessToken, process.env.JWT_SECRET);
		req.user = decoded;
		return { status: 200, user: req.user, newAccessToken: newAccessToken };
	} catch (err) {
		return { status: 403, user: null };
	}
};
