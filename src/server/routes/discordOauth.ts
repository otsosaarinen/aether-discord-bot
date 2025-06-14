import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/auth", async (req, res) => {
	const code = req.body.code;

	const CLIENT_ID = process.env.VITE_DISCORD_CLIENT_ID as string;
	const CLIENT_SECRET = process.env.VITE_DISCORD_CLIENT_SECRET as string;
	const REDIRECT_URI = process.env.VITE_DISCORD_REDIRECT_URI as string;

	if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
		res.status(500).json({ error: "Missing environment variables" });
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

		if (!response.ok) {
			const error = await response.text();
			console.error("Token error:", error);
			res.status(400).json({ error: "Token exchange failed" });
			return;
		}

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
		res.status(200).json(profileData);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
