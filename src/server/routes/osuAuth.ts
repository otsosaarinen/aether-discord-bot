import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/osu/auth", async (req, res) => {
	const code = req.body.code;

	const CLIENT_ID = process.env.VITE_OSU_CLIENT_ID as string;
	const CLIENT_SECRET = process.env.VITE_OSU_CLIENT_SECRET as string;
	const REDIRECT_URI = process.env.VITE_OSU_REDIRECT_URI as string;

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
			res.status(200).json({ data });
			return;
		} else {
			res.status(400).json({ message: "Something went wrong" });
		}
	} catch (error) {
		console.log("adasd");
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
