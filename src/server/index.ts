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
			"http://localhost:5173/",
			"http://localhost:4173/",
			"http://localhost:3001/",
			"https://aether-discord-bot.onrender.com/",
			"https://5dst.org/",
		],
		credentials: true,
	}),
);

app.use(cookieParser());
app.use(express.json());
app.use("/oauth/osu", osuOauthRoute);
app.use("/oauth/discord", discordOauthRoute);
app.use("/oauth", stateOauthRoute);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../../dist");

app.use(express.static(distPath));

app.get("/", (_req, res) => {
	res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server is running on port ${PORT}`);
});
