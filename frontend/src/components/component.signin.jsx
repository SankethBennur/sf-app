import React, { useState } from 'react';

function Signin() {
	const [email, set_email] = useState("");
	const [password, set_password] = useState("");

	async function user_signin()
	{
		const response = await fetch(
			"/api/auth/signin",
			{
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
					'Data-Type': 'application/json'
				},
				body: JSON.stringify({
					email: email,
					password: password
				})
			}
		);

	}

	function handle_input_change(event)
	{
		event.preventDefault();

		switch (event.target.name) {
			case "email":
				set_email(event.target.value);
				break;
			
			case "password":
				set_password(event.target.value);
				break;
		
			default:
				break;
		}

	}

	async function handle_submit(event)
	{
		event.preventDefault();
		await user_signin();
	}

	return (
		<div>
			<form
				onSubmit={(e)=>{handle_submit(e)}}
				style={
					{
						display: "flex",
						flexDirection: "column",
						width: "20%",
					}
				}
			>
				<label htmlFor="email">Email ID: </label>
				<input
					id="email"
					name="email"
					type="text"
					onChange={(e)=>{handle_input_change(e)}}
				/>
				
				<label htmlFor="password">Password: </label>
				<input
					id="password"
					name="password"
					type="password"
					onChange={(e)=>{handle_input_change(e)}}
				/>

				<input id="submit" value="Sign-in" type="submit" />
			</form>
		</div>
	);
}

export default Signin;
