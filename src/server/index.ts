import express from "express";
import cors from "cors";
import osuOauthRoute from "./routes/osuOauth";
import discordOauthRoute from "./routes/discordOauth";
import stateOauthRoute from "./routes/stateOauth";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use("/oauth/osu", osuOauthRoute);
app.use("/oauth/discord", discordOauthRoute);
app.use("/oauth", stateOauthRoute);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
