import "./App.css";
import { useState, useEffect } from "react";

function Auth() {
	// initialize environment variables
	const OSU_CLIENT_ID = import.meta.env.VITE_OSU_CLIENT_ID as string;
	const OSU_REDIRECT_URI = import.meta.env.VITE_OSU_REDIRECT_URI as string;

	const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
	const DISCORD_REDIRECT_URI = import.meta.env
		.VITE_DISCORD_REDIRECT_URI as string;

	const [osuUsername, setOsuUsername] = useState<string>("");
	const [osuId, setOsuId] = useState<number>();
	const [discordUsername, setdiscordUsername] = useState<string>("");
	const [discordId, setdiscordId] = useState<number>();

	// generates random UUID and attaches it to state variable with provider
	const generateState = (): string => {
		const randomUUID: string = crypto.randomUUID();
		return randomUUID;
	};

	// generates state and sends it to to backend for saving, redirects user to either osu/discord oauth page based on the provider value
	const OauthStart = async (provider: "osu" | "discord") => {
		const state = generateState();

		await fetch("http://localhost:3001/oauth/state", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ state, provider }),
		});

		if (provider == "osu") {
			window.location.href = `https://osu.ppy.sh/oauth/authorize?client_id=${OSU_CLIENT_ID}&redirect_uri=${OSU_REDIRECT_URI}&response_type=code&state=${state}`;
		} else if (provider == "discord") {
			window.location.href = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=identify&prompt=none&redirect_uri=${DISCORD_REDIRECT_URI}&response_type=code&state=${state}`;
		}
	};

	// when page loads check if url has code and state parameters and exit function if they dont exist
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

				const { provider } = await fetchProvider.json();

				let authEndpoint = "";
				if (provider === "osu") {
					authEndpoint = "http://localhost:3001/oauth/osu";
				} else if (provider === "discord") {
					authEndpoint = "http://localhost:3001/oauth/discord";
				}

				const tokenRes = await fetch(authEndpoint, {
					method: "POST",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ code }),
				});

				const tokenData = await tokenRes.json();

				if (tokenRes.ok && provider === "osu") {
					setOsuId(tokenData.id);
					setOsuUsername(tokenData.username);
				} else if (tokenRes.ok && provider === "discord") {
					setdiscordId(tokenData.user.id);
					setdiscordUsername(tokenData.user.username);
				}
			} catch (error) {
				console.log(error);
			}
		};
		getAccessToken(code, state);
	}, []);

	return (
		<>
			<div className="font-poppins flex h-screen flex-col items-center justify-center gap-10 bg-neutral-900 text-white">
				<div className="flex flex-col items-center justify-center">
					<h1 className="text-8xl font-bold text-[#4981ff] italic">
						5<span className="text-white">DST</span>3
					</h1>
				</div>
				<div className="flex flex-row items-start justify-center gap-20 text-xl text-white">
					<div className="flex flex-col items-center justify-center gap-3">
						<img
							className="h-12 object-contain"
							src="/discord_logo.png"
							alt="discord logo"
						/>
						<p>Discord ei yhdistetty</p>
						<p
							className="border-2 border-neutral-600 px-3 py-1 font-medium text-green-500 hover:cursor-pointer"
							onClick={() => OauthStart("discord")}
						>
							Yhdistä
						</p>
						<p>discord id: {discordId}</p>
						<p>discord username: {discordUsername}</p>
					</div>
					<div className="flex flex-col items-center justify-center gap-3">
						<img
							className="h-12 object-contain"
							src="/osu_logo.png"
							alt="osu! logo"
						/>
						<p>osu! ei yhdistetty</p>
						<p
							className="border-2 border-neutral-600 px-3 py-1 font-medium text-green-500 hover:cursor-pointer"
							onClick={() => OauthStart("osu")}
						>
							Yhdistä
						</p>
						<p>osu id: {osuId}</p>
						<p>osu username: {osuUsername}</p>
					</div>
				</div>
			</div>
		</>
	);
}

export default Auth;
