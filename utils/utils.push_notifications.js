const axios = require("axios");

const dotenv = require("dotenv");
dotenv.config();

const PUSH_NOTIFICATION_ENDPOINT = process.env.PUSH_NOTIFICATION_ENDPOINT;

const send_notification_to_user = async (user, token, message) =>
{
	try
	{
		const result = { success: false };

		await axios.post(
			PUSH_NOTIFICATION_ENDPOINT,
			{
				to: token,
				sound: "default",
				title: `Greetings traveller`,
				body: message,
			}
		).then(async (response) =>
		{
			result.success = true;
			result.response = response;
		}).catch(async (response) =>
		{
			result.response = response;
		});

		return result;

	}
	catch (error)
	{
		console.log(error.message);
	}

};

module.exports = {
	send_notification_to_user
};
