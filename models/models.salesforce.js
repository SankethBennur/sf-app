const jsforce = require('jsforce');
const dotenv = require("dotenv");
dotenv.config();

const connect_to_salesforce = async () =>
{
	console.log(`Connecting to salesforce ...`);

	const conn = new jsforce.Connection({
		loginUrl: 'https://login.salesforce.com/' // Replace with your instance URL
	});

	const username = `${process.env.SALESFORCE_USERNAME}`;
	const password = `${process.env.SALESFORCE_PASSWORD}${process.env.SALESFORCE_SECURITY_TOKEN}`;

	try
	{
		await conn.login(username, password);
		console.log('Connected to Salesforce. User ID:', conn.userInfo.id);
		return conn;
	}
	catch(err)
	{
		console.error('Login Error:', err);
		throw err;
	}

};

module.exports = connect_to_salesforce;
