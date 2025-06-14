import "./App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

function Auth() {
	const [osuOauthStatus, setOsuOauthStatus] = useState<boolean>(false);
	const [discordOauthStatus, setDiscordOauthStatus] =
		useState<boolean>(false);

	// initialize environment variables
	const OSU_CLIENT_ID = import.meta.env.VITE_OSU_CLIENT_ID as string;
	const OSU_REDIRECT_URI = import.meta.env.VITE_OSU_REDIRECT_URI as string;

	const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
	const DISCORD_REDIRECT_URI = import.meta.env
		.VITE_DISCORD_REDIRECT_URI as string;

	// generates random UUID and attaches it to state variable with provider
	const generateState = (): string => {
		const randomUUID: string = crypto.randomUUID();
		return randomUUID;
	};

	// generates state and sends it to to backend, redirects user to either osu/discord oauth page based on the provider value
	const OauthStart = async (provider: "osu" | "discord") => {
		const state = generateState();

		try {
			await fetch("http://localhost:3001/oauth/state", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ state, provider }),
			});
		} catch (error) {
			console.log("Something went wrong");
		}

		if (provider == "osu") {
			window.location.href = `https://osu.ppy.sh/oauth/authorize?client_id=${OSU_CLIENT_ID}&redirect_uri=${OSU_REDIRECT_URI}&response_type=code&state=${state}`;
		} else if (provider == "discord") {
			window.location.href = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=identify&prompt=none&redirect_uri=${DISCORD_REDIRECT_URI}&response_type=code&state=${state}`;
		}
	};

	useEffect(() => {
		const fetchProgress = async () => {
			try {
				const response = await fetch(
					"http://localhost:3001/oauth/status",
					{
						method: "GET",
						credentials: "include",
					},
				);

				if (response.ok) {
					const data = await response.json();
					setOsuOauthStatus(data.osuOauthDone);
					setDiscordOauthStatus(data.discordOauthDone);
					return;
				} else {
					console.log("Couldn't fetch oauth status");
				}
			} catch (error) {
				console.log("Error while fetching oauth status: ", error);
			}
		};

		fetchProgress();
	}, [osuOauthStatus, discordOauthStatus]);

	// when page loads check if url has code and state parameters, exit function if they dont exist
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");
		const state = urlParams.get("state");

		if (!code || !state) {
			return;
		}

		urlParams.delete("code");
		urlParams.delete("state");
		const newUrl =
			window.location.pathname +
			(urlParams.toString() ? "?" + urlParams.toString() : "");
		window.history.replaceState(null, "", newUrl);

		// if code and state parameters exist in the url, send request to backend to retrieve the saved state
		const getAccessToken = async (code: string, state: string) => {
			try {
				const fetchProvider = await fetch(
					"http://localhost:3001/oauth/provider",
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

				// extract provider from succesful state match request, sends request either to osu or discord api to exchange code to access token
				const data = await fetchProvider.json();
				const provider = data.provider;

				let authEndpoint = "";
				if (provider === "osu") {
					authEndpoint = "http://localhost:3001/oauth/osu";
				} else if (provider === "discord") {
					authEndpoint = "http://localhost:3001/oauth/discord";
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

				if (accessTokenExchange.ok && provider === "osu") {
					console.log("osu success");
				} else if (accessTokenExchange.ok && provider === "discord") {
					console.log("discord success");
				}
			} catch (error) {
				console.log(error);
			}
		};
		getAccessToken(code, state);
	}, []);

	return (
		<>
			<div className="font-poppins flex h-screen flex-col justify-between bg-neutral-900 text-white">
				<div className="flex h-full flex-col items-center justify-center gap-10">
					<div className="flex flex-col items-center justify-center">
						<h1 className="text-9xl font-bold text-[#4981ff] italic">
							5<span className="text-white">DST</span>3
						</h1>
					</div>
					<div className="flex flex-col items-center justify-center gap-10 text-xl text-white">
						<div className="flex flex-col items-center justify-center gap-3">
							<img
								className="w-12 object-contain"
								src="/osu_logo.png"
								alt="osu! logo"
							/>
							<p>Vaihe 1. Yhdistä osu! käyttäjäsi</p>

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
							<p>Vaihe 2. Yhdistä Discord käyttäjäsi</p>

							<Button
								variant="contained"
								disabled={discordOauthStatus}
								onClick={() => OauthStart("discord")}
							>
								Yhdistä
							</Button>
						</div>
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
