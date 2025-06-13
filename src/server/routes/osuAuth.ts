import { Router } from "express";

const router = Router();

router.post("/osu/auth", (req, res) => {
	console.log(req.body);
	res.json({ message: "osu token endpoint reached" });
});

export default router;
