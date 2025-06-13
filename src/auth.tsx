import "./App.css";
import { useState, useEffect } from "react";

function Auth() {
	const OSU_CLIENT_ID = import.meta.env.VITE_OSU_CLIENT_ID as string;
	const OSU_REDIRECT_URI = import.meta.env.VITE_OSU_REDIRECT_URI as string;

	const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
	const DISCORD_REDIRECT_URI = import.meta.env
		.VITE_DISCORD_REDIRECT_URI as string;

	const [osuUsername, setOsuUsername] = useState<string>("");
	const [osuId, setOsuId] = useState<number>();

	const osuAuthStart = () => {
		window.location.href = `https://osu.ppy.sh/oauth/authorize?client_id=${OSU_CLIENT_ID}&redirect_uri=${OSU_REDIRECT_URI}&response_type=code`;
	};

	const discordAuthStart = () => {
		window.location.href = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=identify&redirect_uri=${DISCORD_REDIRECT_URI}&response_type=code`;
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code: string | null = urlParams.get("code");

		if (code) {
			// remove code from the url after it's used once
			urlParams.delete("code");
			const newUrl =
				window.location.pathname +
				(urlParams.toString() ? "?" + urlParams.toString() : "");
			window.history.replaceState(null, "", newUrl);

			const getAccessToken = async (code: string) => {
				const response = await fetch(
					"http://localhost:3001/api/osu/auth",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ code }),
					},
				);

				const data = await response.json();

				if (response.ok) {
					console.log(data);
					setOsuId(data.id);
					setOsuUsername(data.username);
				}
			};

			getAccessToken(code);
		}
	}, []);

	return (
		<>
			<div className="font-poppins flex h-screen flex-col items-center justify-center gap-10 bg-neutral-900">
				<div className="flex flex-col items-center justify-center">
					<h2 className="text-6xl font-semibold text-white italic underline decoration-[#4981ff] decoration-3 underline-offset-5">
						5 Digit Suomi Turnaus 3
					</h2>
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
							onClick={discordAuthStart}
						>
							Yhdistä
						</p>
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
							onClick={osuAuthStart}
						>
							Yhdistä
						</p>
						<p>osu id: {osuId}</p>
						<p>osu username: {osuUsername}</p>
					</div>
				</div>
				<div className="border-2 border-neutral-600 px-3 py-1 font-medium text-green-500 hover:cursor-pointer">
					Continue
				</div>
			</div>
		</>
	);
}

export default Auth;
