import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateAccessToken = (user) => {
	return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '2s' });
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
	} catch (err) { // Token expired donc refresh et faire attention return et si susses
		console.log("Token expired"); // test a sup plus tard
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
		const newAccessToken = generateAccessToken(user);

		const decoded = jwt.verify(newAccessToken, process.env.JWT_SECRET);
		req.user = decoded;
		console.log("newAccessToken"); // test a sup plus tard
		return { status: 200, user: req.user, newAccessToken: newAccessToken };
	} catch (err) {
		console.log("refreshToken expired"); // test a sup plus tard
		return { status: 403, user: null };
	}
};
