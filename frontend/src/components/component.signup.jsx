import React, { useState } from 'react';

function Signup() {
	const [user_name, set_user_name] = useState("");
	const [user_type, set_user_type] = useState("");
	const [phone_no, set_phone_no] = useState("");
	const [email, set_email] = useState("");
	const [password, set_password] = useState("");

	async function user_signup()
	{
		const response = await fetch(
			"/api/auth/signup",
			{
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
					'Data-Type': 'application/json'
				},
				body: JSON.stringify({
					user_name: user_name,
					coordinates: {latitude: 0, longitude: 0},
					user_type: user_type,
					phone_no: phone_no,
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
			case "user_name":
				set_user_name(event.target.value);
				break;
			
			case "user_type":
				set_user_type(event.target.value);
				break;
			
			case "phone_no":
				set_phone_no(event.target.value);
				break;
			
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
		await user_signup();
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
				<label htmlFor="user_name">User Name: </label>
				<input
					id="user_name"
					name="user_name"
					type="text"
					onChange={(e)=>{handle_input_change(e)}}
				/>
				
				<label htmlFor="user_type">User type: </label>
				<input
					id="user_type"
					name="user_type"
					type="text"
					onChange={(e)=>{handle_input_change(e)}}
				/>
				
				<label htmlFor="phone_no">Phone number: </label>
				<input
					id="phone_no"
					name="phone_no"
					type="text"
					onChange={(e)=>{handle_input_change(e)}}
				/>
				
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

				<input id="submit" value="Sign-up" type="submit" />
			</form>
		</div>
	);
}

export default Signup;
