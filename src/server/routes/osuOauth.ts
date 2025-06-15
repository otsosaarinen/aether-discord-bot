import { Router } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { addOsuDataToDb, updateOsuOauthStatus } from "../../db/queries";

dotenv.config();

const router = Router();

router.post("/", async (req, res) => {
	const code = req.body.code;

	const CLIENT_ID = process.env.VITE_OSU_CLIENT_ID as string;
	const CLIENT_SECRET = process.env.VITE_OSU_CLIENT_SECRET as string;
	const REDIRECT_URI = process.env.VITE_OSU_REDIRECT_URI as string;
	const JWT_SECRET = process.env.JWT_SECRET as string;

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
		const response = await fetch("https://osu.ppy.sh/oauth/token", {
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

			const osuProfileData = await fetch(
				"https://osu.ppy.sh/api/v2/me/osu",
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						Authorization: `Bearer ${access_token}`,
					},
				},
			);

			const profileData = await osuProfileData.json();

			const userObject = {
				osu_id: profileData.id,
				osu_username: profileData.username,
				rank: profileData.statistics_rulesets.osu.global_rank,
				country: profileData.country_code,
			};

			await addOsuDataToDb(userObject);

			console.log(`OSU: ${profileData.username} added to db`);

			await updateOsuOauthStatus(profileData.id, true);

			const payload = { id: profileData.id };

			const token = jwt.sign(payload, JWT_SECRET, {
				expiresIn: "1d",
			});

			res.cookie("token", token, {
				maxAge: 24 * 60 * 60 * 1000,
				sameSite: "strict",
				httpOnly: true,
			})
				.status(200)
				.json(userObject);
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
