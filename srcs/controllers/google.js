import crypto from "crypto";
import jwt from "jsonwebtoken";
import {createUserGoogle} from '../dist/prisma/seed.js';
import {loginUserGoogle} from './loginUser.js';


export const googleAuth = async (req, reply) => {
	let port = "", protocol = "https";
	if (req.hostname === "localhost") {
		protocol = "http";
		port = ":3000";
	}
	const redirectUri = `${protocol}://${req.hostname}${port}/auth/google/callback`;
	if (!global.oauthStates) {
		global.oauthStates = new Map();
	}
	const clientId = process.env.GOOGLE_CLIENT_ID; // doit correspondre à l’ID client dans Google Cloud Console
	const scope = encodeURIComponent("openid email profile");
	const state = crypto.randomUUID();; // optionnel, pour prévenir des attaques CSRF
	const responseType = "code";


	const sessionId = crypto.randomUUID();
	global.oauthStates.set(sessionId, {
		state,
		timestamp: Date.now(),
	});

	reply.setCookie("session_id", sessionId, {
		httpOnly: true,
		secure: false,
		sameSite: "lax",
		path: "/",
		maxAge: 300,
	});

	const authUrl =
		`https://accounts.google.com/o/oauth2/v2/auth?` +
		`client_id=${clientId}&` +
		`redirect_uri=${encodeURIComponent(redirectUri)}&` +
		`response_type=${responseType}&` +
		`scope=${scope}&` +
		`state=${state}`;

	reply.redirect(authUrl);
}

async function exchangeCodeForTokens(req, code) {
	let port = "", protocol = "https";
	if (req.hostname === "localhost") {
		protocol = "http";
		port = ":3000";
	}
	const redirectUri = `${protocol}://${req.hostname}${port}/auth/google/callback`;
	const params = new URLSearchParams();
	params.append('code', code);
	params.append('client_id', process.env.GOOGLE_CLIENT_ID);
	params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
	params.append('redirect_uri', redirectUri);
	params.append('grant_type', 'authorization_code');

	const response = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: params,
	});

	const data = await response.json();

	if (data.error) {
		return {
			error: data.error,
			error_description: data.error_description,
		};
	}

	return {
		access_token: data.access_token,
		id_token: data.id_token,
		refresh_token: data.refresh_token,
		expires_in: data.expires_in,
	};
}

export const googleCallback = async (req, reply) => {
	const returnedState = req.query.state;
	const sessionId = req.cookies.session_id;
	const oauth_state = global.oauthStates.get(sessionId);
	global.oauthStates.delete(sessionId);

	if (returnedState !== oauth_state.state) {
		reply.status(403).send("State mismatch. Possible CSRF attack.");
		return;
	}
	const code = req.query.code;
	if (code) {
		let tokens = await exchangeCodeForTokens(req, code);
		if (tokens.id_token) {
			const decoded = jwt.decode(tokens.id_token);
			await createUserGoogle(decoded.given_name, decoded.email, decoded.picture);
			return loginUserGoogle(req, reply, decoded.email);
		}
	} else {
		console.error("Aucun code reçu", returnedState);
	}
}
