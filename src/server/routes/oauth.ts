import { Router } from "express";
import { saveState, fetchState } from "../../db/queries";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// saved the initial state before user is redirected to oauth page
router.post("/state", async (req, res) => {
	try {
		const { state, provider } = req.body;

		if (!state || !provider) {
			res.status(400).send("Missing state or provider");
			return;
		}

		// save state and provider to db
		await saveState(state, provider);

		res.status(200).send("State saved");
		return;
	} catch (error) {
		console.log(error);
		res.status(500).send("Error with saving state and provider");
		return;
	}
});

// check if the initial state matches the state after being redirected to callback url
router.post("/provider", async (req, res) => {
	try {
		const { state } = req.body;

		if (!state) {
			res.status(400).send("State is missing");
			return;
		}

		// fetch state saved to db and compare it with state received from client
		const data = await fetchState(state);

		if (!data) {
			res.status(400).send("Invalid state");
			return;
		}

		res.status(200).json({ provider: data.provider });
		return;
	} catch (error) {
		console.log(error);
		res.status(500).send("Internal server error");
		return;
	}
});

router.post("/status", async (req, res) => {
	res.status(200).send();
});

export default router;
