import { Router } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { addDiscordDataToDb, updateDiscordOauthStatus } from "../../db/queries";

dotenv.config();

const router = Router();

router.post("/", async (req, res) => {
	const code = req.body.code;

	const CLIENT_ID = process.env.VITE_DISCORD_CLIENT_ID as string;
	const CLIENT_SECRET = process.env.VITE_DISCORD_CLIENT_SECRET as string;
	const REDIRECT_URI = process.env.VITE_DISCORD_REDIRECT_URI as string;
	const JWT_SECRET = process.env.JWT_SECRET as string;

	if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
		res.status(500).json({ error: "Missing environment variables" });
		return;
	}

	let verifyJwt: any;

	try {
		verifyJwt = jwt.verify(req.cookies.token, JWT_SECRET);
	} catch (error) {
		console.log(error);
		res.status(400).send("Problem with JWT");
		return;
	}

	const body = new URLSearchParams({
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		code: code,
		grant_type: "authorization_code",
		redirect_uri: REDIRECT_URI,
	});

	try {
		const response = await fetch("https://discord.com/api/oauth2/token", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body,
		});

		if (response.ok) {
			const data = await response.json();
			const access_token = data.access_token;

			const discordProfileData = await fetch(
				"https://discord.com/api/oauth2/@me",
				{
					method: "GET",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/x-www-form-urlencoded",
						Authorization: `Bearer ${access_token}`,
					},
				},
			);

			const profileData = await discordProfileData.json();

			const userObject = {
				osu_id: verifyJwt.id,
				discord_id: profileData.user.id,
				discord_username: profileData.user.username,
			};

			await addDiscordDataToDb(userObject);

			console.log(`DISCORD: ${profileData.user.username} added to db`);

			await updateDiscordOauthStatus(verifyJwt.id, true);

			res.status(200).json(profileData);
			return;
		} else {
			res.status(400).json({ error: "Token exchange failed" });
			return;
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
