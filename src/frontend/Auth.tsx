import "./App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Button from "@mui/material/Button";
import DoneIcon from "@mui/icons-material/Done";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import type { SnackbarCloseReason } from "@mui/material/Snackbar";

function Auth() {
	// initialize variables
	const [osuOauthStatus, setOsuOauthStatus] = useState<boolean>(false);
	const [discordOauthStatus, setDiscordOauthStatus] =
		useState<boolean>(false);
	const [progressBarStatus, setProgressBarStatus] = useState<number>(0);
	const [snackbarVisibility, setSnackbarVisibility] = useState(false);

	// initialize environment variables
	const EXPRESS_URL = import.meta.env.VITE_EXPRESS_URL as string;
	const OSU_CLIENT_ID = import.meta.env.VITE_OSU_CLIENT_ID as string;
	const OSU_REDIRECT_URI = import.meta.env.VITE_OSU_REDIRECT_URI as string;
	const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
	const DISCORD_REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI;
	console.log(
		`Environment variables: ${EXPRESS_URL} ${OSU_CLIENT_ID} ${OSU_REDIRECT_URI} ${DISCORD_CLIENT_ID} ${DISCORD_REDIRECT_URI}`,
	);

	// generates random UUID
	const generateState = (): string => {
		const randomUUID: string = crypto.randomUUID();
		return randomUUID;
	};

	// generates state and sends it to to backend, redirects user to either osu/discord oauth page based on the provider value
	const OauthStart = async (provider: "osu" | "discord") => {
		const state = generateState();

		try {
			await fetch(`${EXPRESS_URL}/oauth/state`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ state, provider }),
			});

			if (provider == "osu") {
				window.location.href = `https://osu.ppy.sh/oauth/authorize?client_id=${OSU_CLIENT_ID}&redirect_uri=${OSU_REDIRECT_URI}&response_type=code&state=${state}`;
			} else if (provider == "discord") {
				window.location.href = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=identify&prompt=none&redirect_uri=${DISCORD_REDIRECT_URI}&response_type=code&state=${state}`;
			}
		} catch (error) {
			console.log(
				"Something went wrong while saving request state: ",
				error,
			);
			return;
		}
	};

	// sends request to backend and receives OAuth process status as a response, sets the progressbar and snackbar visibility based on the response
	const fetchProgress = async () => {
		try {
			const response = await fetch(`${EXPRESS_URL}/oauth/status`, {
				method: "GET",
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				const { osuOauthDone, discordOauthDone } = data;

				setOsuOauthStatus(osuOauthDone);
				setDiscordOauthStatus(discordOauthDone);

				let progress = 0;
				if (osuOauthDone && discordOauthDone) {
					progress = 2;
					setSnackbarVisibility(true);
				} else if (osuOauthDone || discordOauthDone) {
					progress = 1;
				}

				setProgressBarStatus(progress);
			} else {
				console.log("Couldn't fetch oauth status");
			}
		} catch (error) {
			console.log("Error while fetching oauth status: ", error);
		}
	};

	// run fetchProgress on page load
	useEffect(() => {
		fetchProgress();
	}, []);

	// on page load check if url has code and state parameters, exit if they dont exist
	// if code and state exist send request to backend to verify that url state matches the initial state before redirect to OAuth page
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");
		const state = urlParams.get("state");

		if (!code || !state) {
			return;
		}

		// clear code and state from the url
		urlParams.delete("code");
		urlParams.delete("state");
		const newUrl =
			window.location.pathname +
			(urlParams.toString() ? "?" + urlParams.toString() : "");
		window.history.replaceState(null, "", newUrl);

		const getAccessToken = async (code: string, state: string) => {
			try {
				const fetchProvider = await fetch(
					`${EXPRESS_URL}/oauth/provider`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ state }),
					},
				);

				if (!fetchProvider.ok)
					throw new Error("Invalid state or provider");

				// extract provider from succesful state match, sends request either to osu or discord backend api route which manages to access token exchange
				const data = await fetchProvider.json();
				const provider = data.provider;

				let authEndpoint = "";
				if (provider === "osu") {
					authEndpoint = `${EXPRESS_URL}/oauth/osu`;
				} else if (provider === "discord") {
					authEndpoint = `${EXPRESS_URL}/oauth/discord`;
				}

				const accessTokenExchange = await fetch(authEndpoint, {
					method: "POST",
					credentials: "include",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ code }),
				});

				// run fetchProgress after succesfully exchange access token to update button visibility
				if (accessTokenExchange.ok) {
					await fetchProgress();
				}
			} catch (error) {
				console.log(error);
			}
		};
		getAccessToken(code, state);
	}, []);

	// steps for progressbar
	const steps = [
		"Yhdistä osu! käyttäjäsi",
		"Yhdistä Discord käyttäjäsi",
		"Valmista",
	];

	// variables for snackbar
	const handleClose = (
		_event?: React.SyntheticEvent | Event,
		reason?: SnackbarCloseReason,
	) => {
		if (reason === "clickaway") {
			return;
		}
		setSnackbarVisibility(false);
	};

	return (
		<>
			<div className="font-poppins flex h-screen flex-col justify-between bg-neutral-900 text-white">
				<div className="flex h-full flex-col items-center justify-center gap-10">
					<div className="flex flex-col items-center justify-center">
						<h1 className="text-9xl font-bold text-[#4981ff] italic">
							5<span className="text-white">DST</span>3
						</h1>
					</div>
					<div>
						<Stepper
							activeStep={progressBarStatus}
							alternativeLabel
						>
							{steps.map((label) => (
								<Step key={label}>
									<StepLabel>
										<p className="text-white">{label}</p>
									</StepLabel>
								</Step>
							))}
						</Stepper>
					</div>
					<div className="flex flex-col items-center justify-center gap-10 text-xl text-white">
						<div className="flex flex-col items-center justify-center gap-3">
							<img
								className="w-12 object-contain"
								src="/osu_logo.png"
								alt="osu! logo"
							/>
							<div className="flex flex-row items-center justify-center">
								{osuOauthStatus ? (
									<p className="text-neutral-500 line-through">
										Vaihe 1. Yhdistä osu! käyttäjäsi
									</p>
								) : (
									<p>Vaihe 1. Yhdistä osu! käyttäjäsi</p>
								)}
								<span className="ml-2">
									{osuOauthStatus ? (
										<DoneIcon sx={{ color: "#75FB4C" }} />
									) : (
										""
									)}
								</span>
							</div>

							<Button
								variant="contained"
								disabled={osuOauthStatus}
								onClick={() => OauthStart("osu")}
							>
								Yhdistä
							</Button>
						</div>
						<div className="flex flex-col items-center justify-center gap-3">
							<img
								className="w-12 object-contain"
								src="/discord_logo.png"
								alt="discord logo"
							/>
							<div className="flex flex-row items-center justify-center">
								{discordOauthStatus ? (
									<p className="text-neutral-500 line-through">
										Vaihe 2. Yhdistä Discord käyttäjäsi
									</p>
								) : (
									<p>Vaihe 2. Yhdistä Discord käyttäjäsi</p>
								)}
								<span className="ml-2">
									{discordOauthStatus ? (
										<DoneIcon sx={{ color: "#75FB4C" }} />
									) : (
										""
									)}
								</span>
							</div>

							<Button
								variant="contained"
								disabled={!osuOauthStatus || discordOauthStatus}
								onClick={() => OauthStart("discord")}
							>
								Yhdistä
							</Button>
						</div>
					</div>

					<div>
						<Snackbar
							open={snackbarVisibility}
							autoHideDuration={7000}
							onClose={handleClose}
							anchorOrigin={{
								vertical: "top",
								horizontal: "center",
							}}
						>
							<Alert
								onClose={handleClose}
								severity="success"
								variant="filled"
								sx={{ width: "100%" }}
							>
								Rekisteröinti onnistui.
							</Alert>
						</Snackbar>
					</div>
				</div>
				<div className="flex h-14 w-full items-center justify-center bg-[#4981ff]">
					<p>
						Site developed by{" "}
						<Link
							to="https://osu.ppy.sh/users/6263040"
							className="hover:underline"
						>
							Aetherian
						</Link>
					</p>
				</div>
			</div>
		</>
	);
}

export default Auth;
