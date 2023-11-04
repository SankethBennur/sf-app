import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";


function Services() {
	const [inv_data, set_inv_data] = useState([]);

	const get_salesforce_data = async () => {
		const response = await fetch("/api/services/salesforce");
		const data = await response.json();

		set_inv_data(data.list_of_investors);

	};
	
	useEffect(() => {
		get_salesforce_data();
		
	}, []);
	

	return (
		<Grid>
			Services
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Asset manager</th>
						<th>Mutual Fund</th>
						<th>SIP</th>
					</tr>
					{
						inv_data.map((elem)=>(
							<tr>
								<td>{elem.name}</td>
								<td>{elem.asset_manager_name__c}</td>
								<td>{elem.mf_invested__c}</td>
								<td>{elem.sip_invested__c}</td>
							</tr>
							)
						)
					}
				</thead>
			</table>
		</Grid>
	)
}

export default Services;
