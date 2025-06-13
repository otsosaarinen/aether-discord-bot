import "./App.css";

function Auth() {
	return (
		<>
			<div className="font-poppins flex h-screen flex-col items-center justify-center bg-neutral-900">
				<div className="text-xl text-white">
					<div className="flex flex-row gap-3">
						Yhdistä Discord käyttäjäsi
						<div className="text-green-500">Yhdistä</div>
					</div>
					<div className="flex flex-row gap-3">
						Yhdistä osu! käyttäjäsi
						<div className="text-green-500">Yhdistä</div>
					</div>
					<div>Valmista</div>
				</div>
			</div>
		</>
	);
}

export default Auth;
