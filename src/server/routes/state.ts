import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const oauthStates = new Map<string, { provider: string; createdAt: number }>();

router.post("/state", async (req, res) => {
	try {
		const { state, provider } = req.body;

		if (!state || !provider) {
			res.status(400).send("Missing state or provider");
			return;
		}
		oauthStates.set(state, {
			provider,
			createdAt: Date.now(),
		});

		res.status(200).send("State saved");
	} catch (error) {
		console.log(error);
		res.status(500).send("Error with saving state and provider");
	}
});

router.post("/provider", async (req, res) => {
	const { state } = req.body;

	const data = oauthStates.get(state);
	if (!data) {
		res.status(400).send("Invalid state");
		return;
	}

	res.status(200).json({ provider: data.provider });
});

export default router;
