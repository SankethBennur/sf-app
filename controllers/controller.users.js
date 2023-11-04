const express = require("express");
const router = express.Router();

const {
	validate_http_queries,
	validate_user_id_registered,
} = require("../lib/lib.middleware");

const { update_user_details, get_user_details } = require("../src/src.users");

const { multer_upload } = require("../utils/utils.file_upload");

router.get(
	"/",
	validate_http_queries(["user_id_list"]),
	async (request, response) =>
	{
		try
		{
			const user_id_list_ = (request.query.user_id_list).replace(/\s/g, '').split(',');

			if (!user_id_list_.length || user_id_list_.length <= 0)
			{
				response.
					status(400).
					json(
						{
							error: "User ID is invalid"
						}
					);

				return;

			}

			const user_result_ = await get_user_details(
				user_id_list_,
				(
					request.query.only_registered &&
					request.query.only_registered.toLowerCase() === "true"
				)
					? true
					: false
			);

			if (user_result_.status !== "success")
			{
				response.
					status(200).
					json(
						{
							status: `fail`,
							message: `Could not get any user details from the list of users - ${user_id_list_}`,
						}
					);
				return;
			}

			response.
				status(200).
				json(
					{
						success: true,
						result: user_result_.user_result,
					}
				);

		}
		catch (error)
		{
			response.
				status(500).
				json(
					{
						message: `An unexpected error ocurred.`,
						error: error.message,
					}
				);
		}

	}
);

router.patch(
	"/",
	validate_http_queries(["user_id"]),
	validate_user_id_registered(),
	async (request, response) =>
	{
		const user_id = request.query.user_id;

		if (!user_id)
		{
			response.
				status(500).
				json(
					{
						message: `Invalid user ID - ${user_id}`
					}
				);
			return;
		}

		try
		{
			const new_values = request.body;

			const user_update_result = await update_user_details(user_id, new_values);

			if (user_update_result.status === "fail")
			{
				response.
					status(500).
					json(
						{
							message: `Unable to update user details`,
							user_update_result: user_update_result,
						}
					);
				return;
			}

			response.
				status(200).
				json(
					{
						message: `Successfully updated user details for user ID - ${user_id}`,
						user_update_result: user_update_result,
					}
				);

		}
		catch (error)
		{
			response.
				status(404).
				json(
					{
						message: `Unable to update user details for user ID - ${user_id}`,
						error: error.message,
					}
				);
		}

	}
);

router.post(
	"/image",
	validate_http_queries(["user_id"]),
	validate_user_id_registered(),
	multer_upload.single("profile-picture"),
	async (request, response) =>
	{
		const user_id = request.query.user_id;

		if (!user_id)
		{
			response.
				status(500).
				json(
					{
						message: "Invalid user ID",
					}
				);

			return;
		}

		try
		{
			// Get file storage location
			if (!request.file)
			{
				response.
					status(500).
					json(
						{
							message: `Could not upload file`,
						}
					);

				return;
			}

			const file_name_ = request.file.filename;

			// Patch user record
			const user_update_result = await update_user_details(user_id, {
				"profile_pic_URL__c": file_name_,
			});

			if (user_update_result.status === "fail")
			{
				response.
					status(500).
					json(
						{
							message: "Could not save uploaded file.",
						}
					);

				return;
			}

			response.
				status(200).
				json(
					{
						message: `Successfully uploaded file for user ID - ${user_id}`,
						user_update_result: user_update_result.update_result,
					}
				);

		}
		catch (error)
		{
			response.
				status(500).
				json(
					{
						message: "An unexpected error ocurred",
						error: error.message,
					}
				);

		}
	});

module.exports = router;
