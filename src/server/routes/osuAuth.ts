import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/osu/auth", async (req, res) => {
	const code = req.body.code;

	const CLIENT_ID = process.env.VITE_OSU_CLIENT_ID as string;
	const CLIENT_SECRET = process.env.VITE_OSU_CLIENT_SECRET as string;
	const REDIRECT_URI = process.env.OSU_REDIRECT_URI as string;

	if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
		res.status(500).json({ error: "Missing environment variables" });
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
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body,
		});

		res.status(200).json({ message: response });
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
	}
	res.json({ message: "osu token endpoint reached" });
});

export default router;
