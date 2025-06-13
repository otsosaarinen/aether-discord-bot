import express from "express";
import cors from "cors";
import osuAuthRoute from "./routes/osuAuth";
import stateVerifyRoute from "./routes/state";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use("/api/osu", osuAuthRoute);
app.use("/api/oauth", stateVerifyRoute);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
