import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import osuOauthRoute from "./routes/osuOauth";
import discordOauthRoute from "./routes/discordOauth";
import stateOauthRoute from "./routes/oauth";

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/oauth/osu", osuOauthRoute);
app.use("/oauth/discord", discordOauthRoute);
app.use("/oauth", stateOauthRoute);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
