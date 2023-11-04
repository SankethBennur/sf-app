const express = require("express");
const router = express.Router();

const {
	validate_http_queries,
	validate_http_body_arguments,
} = require("../lib/lib.middleware");

const {
	register_token_for_user,
	send_push_notification_to_user,
} = require("../src/src.push_notifications");

router.post(
	"/token",
	validate_http_queries(["user_id", "token"]),
	async (request, response) =>
	{
		const user_id_ = request.query.user_id;
		const token_ = request.query.token;

		try
		{
			const register_token_result_ = await register_token_for_user(user_id_, token_);

			if (register_token_result_.status !== "success")
			{
				response.
					status(400).
					json(
						{
							message: `Could not register device for user ID - '${user_id_}'`
						}
					);

				return;
			}

			response.
				status(200).
				json(
					{
						message: `Successfully registered device for user ID - '${user_id_}'`,
						result: register_token_result_,
					}
				);

		}
		catch (error)
		{
			response.
				status(500).
				json(
					{
						message: `An unexpected error ocurred for user ID - ${user_id_}`,
						error: error.message,
					}
				);
		}

	}
);

// Endpoint to send a notification
router.post(
	"/send-notification",
	validate_http_body_arguments(["user_id", "message"]),
	async (request, response) =>
	{
		const user_id_ = request.body.user_id;
		const message_ = request.body.message;
		
		try
		{
			const send_notif_res_ = await send_push_notification_to_user(user_id_, message_);

			if (send_notif_res_.status !== "success")
			{
				response.
					status(400).
					json(
						{
							message: `Could not send push notification to user ID - ${user_id_}`,
							result: send_notif_res_,
						}
					);
				return;
			}

			response.
				status(200).
				json(
					{
						success: true,
						message: `Successfully sent push notification to user ID - ${user_id_}`,
					}
				);

		}
		catch (error)
		{
			response.
				status(400).
				json(
					{
						message: `An unexpected error ocurred.`,
						error: error.message,
					}
				);
		}

	});

module.exports = router;
