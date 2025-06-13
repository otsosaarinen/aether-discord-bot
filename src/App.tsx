import "./App.css";
import { Link } from "react-router";

function App() {
	return (
		<>
			<div className="font-poppins flex h-screen flex-col items-center justify-center bg-neutral-900">
				<div className="flex w-200 flex-col items-center justify-center border-3 border-white p-5">
					<h1 className="text-8xl font-bold text-[#4981ff]">5DST</h1>
					<h2 className="text-5xl font-semibold text-white italic underline decoration-[#4981ff] decoration-2 underline-offset-4">
						5 Digit Suomi Turnaus
					</h2>
					<div className="mt-8 bg-[#4981ff] p-2 text-2xl text-white">
						<Link to="/auth">Rekisteröidy tästä</Link>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
