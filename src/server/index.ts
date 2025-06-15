import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import osuOauthRoute from "./routes/osuOauth";
import discordOauthRoute from "./routes/discordOauth";
import stateOauthRoute from "./routes/oauth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
