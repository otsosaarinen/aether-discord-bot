import "./App.css";
import { useState } from "react";

function Auth() {
	const [discordStatus, setDiscordStatus] = useState<boolean>(false);
	const [osuStatus, setOsuStatus] = useState<boolean>(false);

	const osuAuthStart = () => {
		const OSU_CLIENT_ID = import.meta.env.VITE_OSU_CLIENT_ID as string;
		const OSU_REDIRECT_URI = import.meta.env
			.VITE_OSU_REDIRECT_URI as string;

		window.location.href = `https://osu.ppy.sh/oauth/authorize?client_id=${OSU_CLIENT_ID}&redirect_uri=${OSU_REDIRECT_URI}&response_type=code`;
	};

	return (
		<>
			<div className="font-poppins flex h-screen flex-col items-center justify-center gap-10 bg-neutral-900">
				<div className="flex flex-col items-center justify-center">
					<h2 className="text-6xl font-semibold text-white italic underline decoration-[#4981ff] decoration-3 underline-offset-5">
						5 Digit Suomi Turnaus 3
					</h2>
				</div>
				<div className="flex flex-row gap-20 text-xl text-white">
					<div className="flex flex-col items-center justify-center gap-3">
						<img
							className="w-12 object-contain"
							src="/discord_logo.png"
							alt="discord logo"
						/>
						<p>Discord ei yhdistetty</p>
						<p className="border-2 border-neutral-600 px-3 py-1 font-medium text-green-500">
							Yhdistä
						</p>
					</div>
					<div className="flex flex-col items-center justify-center gap-3">
						<img
							className="w-12 object-contain"
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
					</div>
				</div>
			</div>
		</>
	);
}

export default Auth;
