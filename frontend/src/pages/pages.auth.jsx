import React, { useEffect, useState } from "react";
import Signup from "../components/component.signup";
import Signin from "../components/component.signin";


function Auth(props) {
	const [signin_page, set_signin_page] = useState(
		(props.sign === "up") ?
		false :
		true
	);

	useEffect(() => {
	}, [signin_page]);
	
	return (
		<div>
			{
				(signin_page)?
				<Signin /> :
				<Signup /> 
			}
			
				()?
				Already registered?&nbsp;<button
				id="sign_toggle"
				name="sign_toggle"
				onClick={()=>{set_signin_page((signin_page)?false:true)}}
				>
				Sign in
				</button>:

			Already registered?&nbsp;<button
				id="sign_toggle"
				name="sign_toggle"
				onClick={()=>{set_signin_page((signin_page)?false:true)}}
				>
				Sign in
				</button>
		</div>
	);
}

export default Auth;
