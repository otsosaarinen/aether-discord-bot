import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import osuOauthRoute from "./routes/osuOauth";
import discordOauthRoute from "./routes/discordOauth";
import stateOauthRoute from "./routes/oauth";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(
	cors({
		origin: [
			"http://localhost:5173",
			"http://localhost:4173",
			"http://localhost:3001",
			"https://aether-discord-bot.onrender.com",
		],
		credentials: true,
	}),
);

app.use(cookieParser());
app.use(express.json());
app.use("/oauth/osu", osuOauthRoute);
app.use("/oauth/discord", discordOauthRoute);
app.use("/oauth", stateOauthRoute);

// Serve static files
app.use(express.static(path.join(__dirname, "../../dist")));

// API route
app.get("/api", (_, res) => {
	res.status(200).json({ message: "API is online" });
});

// SPA fallback
app.get("*", (_, res) => {
	res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server is running on port ${PORT}`);
});
