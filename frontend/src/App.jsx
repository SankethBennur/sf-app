import React from "react";
import { Routes, Route } from "react-router-dom";

import Auth from "./pages/pages.auth";
// import Agent from "./pages/pages.agent";
import Services from "./pages/pages.services";

function App() {
	return (
		<div className="App">
			<Routes>
				<Route exact path="/" element={
					<React.Fragment> Home page </React.Fragment>
				} />

				<Route path="/*" element={
					<React.Fragment>
						<h1>
							Page not found
						</h1>
					</React.Fragment>
				} />

				<Route path="/auth" element={<Auth sign={"up"}/>} />
				
				<Route path="/services" element={<Services />} />

				{/* <Route path="/agent" element={<Agent />} /> */}
				
			</Routes>
		</div>
	);
}

export default App;
