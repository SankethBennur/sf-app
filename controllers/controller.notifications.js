const express = require("express");
const router = express.Router();

const {
	validate_http_body_arguments,
	validate_http_queries
} = require("../lib/lib.middleware");

const {
	get_notification_list,
	create_new_notification,
	mark_read_notification,
	mark_read_notification_list
} = require("../src/src.notifications");

router.get(
	"/",
	async (request, response) =>
	{
		if (!(
			request.query.notification_id_list ||
			request.query.user_id_list
		))
		{
			response.
				status(500).
				json({
					message: `Notification ID List and User ID List missing`
				});

			return;
		}

		try
		{
			const notification_id_list_ = (request.query.notification_id_list)
				? (request.query.notification_id_list).replace(/\s/g, '').split(',')
				: [];

			const user_id_list_ = (request.query.user_id_list)
				? (request.query.user_id_list).replace(/\s/g, '').split(',')
				: [];

			const get_notification_list_res_ = await get_notification_list(
				notification_id_list_,
				user_id_list_
			);

			if (get_notification_list_res_.status === "fail")
			{
				response.
					status(500).
					json({
						message: `Could not get notifications`,
						notification_result: get_notification_list_res_,
					});

				return;
			}

			response.
				status(200).
				json({
					message: `Successfully got notifications`,
					notification_result: get_notification_list_res_,
				});

			return;

		}
		catch (error)
		{
			console.log(error.message);

			response.
				status(500).
				json({
					message: `An unexpected error ocurred`,
					error: error.message,
				});

		}

	}
);

router.post(
	"/",
	validate_http_body_arguments(["user_id", "subject", "message"]),
	async (request, response) => 
	{
		const user_id_ = request.body.user_id;
		const subject_ = request.body.subject;
		const message_ = request.body.message;

		try
		{
			const add_notification_res_ = await create_new_notification(user_id_, subject_, message_);

			if (add_notification_res_.status === "fail")
			{
				response.
					status(500).
					json({
						message: `Could not add notification`,
						notification_result: add_notification_res_,
					});

				return;
			}

			response.
				status(200).
				json({
					message: `Successfully added notification for user - ${user_id_}`,
					notification_result: add_notification_res_,
				});

		}
		catch (error)
		{
			response.
				status(500).
				json({
					message: `An unexpected error ocurred`,
					error: error.message,
				});
		}
	}
)

router.patch(
	"/",
	validate_http_queries(["notification_id"]),
	async (request, response) =>
	{
		const notification_id_ = request.query.notification_id;

		try
		{
			const patch_notification_res_ = await mark_read_notification(notification_id_);

			if (patch_notification_res_.status === "fail")
			{
				response.
					status(500).
					json({
						message: `Could not patch notification`,
						notification_result: patch_notification_res_,
					});

				return;
			}

			response.
				status(200).
				json({
					message: `Successfully marked notification as read`,
					notification_result: patch_notification_res_,
				});

		}
		catch (error)
		{
			response.
				status(500).
				json({
					message: `An unexpected error ocurred`,
					error: error.message,
				});
		}

	}
);

router.patch(
	"/mark-read-many",
	validate_http_queries(["notification_id_list"]),
	async (request, response) =>
	{
		try
		{
			const notification_id_list_ = (request.query.notification_id_list).
				replace(/\s/g, '').
				split(',');

			const mark_read_notification_list_res_ = await mark_read_notification_list(notification_id_list_);

			if(mark_read_notification_list_res_.status === "fail")
			{
				response.
					status(500).
					json({
						message: "Failed to mark notifications as read",
						mark_read_notification_list_result: mark_read_notification_list_res_,
					});
				return;
			}

			response.
				status(200).
				json({
					mark_read_notification_list_result: mark_read_notification_list_res_,
				});
		}
		catch(error)
		{
			response.
				status(500).
				json({
					message: `An unexpected error ocurred`,
					error: error.message,
				});
		}
	}
);

module.exports = router;
