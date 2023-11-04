const express = require("express");
const router = express.Router();

const {
	update_service_status,
	add_service_comment,
	get_service_comment_with_service_user_IDs,
	get_all_service_types
} = require("../src/src.service_status");

const { validate_http_queries, validate_http_body_arguments } = require("../lib/lib.middleware");

router.patch(
	"/",
	validate_http_body_arguments(["service_id", "target_status", "agent_id", "comment"]),
	async (request, response) =>
	{
		const service_id = request.body.service_id;
		const target_status = request.body.target_status;
		const agent_id = request.body.agent_id;
		const comment_ = request.body.comment

		if (!(service_id && target_status))
		{
			response.
				status(500).
				json(
					{
						message: `Service ID is invalid`,
					}
				);

			return;
		}

		try
		{
			const service_status_result = await update_service_status(
				service_id,
				target_status,
				agent_id
			);

			if (service_status_result.status === "fail")
			{
				response.
					status(500).
					json(
						{
							message: `Unable to update service status.`,
							service_status_result: service_status_result,
						}
					);

				return;
			}

			if (comment_)
				add_service_comment(
					service_id,
					agent_id,
					comment_
				);

			add_service_comment(
				service_id,
				agent_id,
				`Service status updated to '${target_status}' on ${(new Date()).toISOString()}`
			);

			response.
				status(200).
				json(
					{
						message: `Service status updated for service ID - ${service_id}`,
						service_status_result: service_status_result,
					}
				);

		}
		catch (error)
		{
			response.
				status(500).
				json(
					{
						message: `An unexpected error ocurred`,
						error: error.message,
					}
				);
		}

	}
);

router.post(
	"/comment",
	validate_http_queries(["service_id"]),
	validate_http_body_arguments(["commented_by", "comment"]),
	async (request, response) =>
	{
		const service_id = request.query.service_id;
		const commented_by = request.body.commented_by;
		const comment = request.body.comment;

		try
		{
			const service_comment_result = await add_service_comment(service_id, commented_by, comment);

			if (service_comment_result.status === "fail")
			{
				response.
					status(500).
					json(
						{
							message: `Unable to add comment by user ID - ${commented_by} for service ID - ${service_id}`,
							service_comment_result: service_comment_result,
						}
					);

				return;
			}

			response.
				status(200).
				json(
					{
						message: `Comment successfully added for service ID - ${service_id} by user ID - ${commented_by}`,
						service_comment_result: service_comment_result,
					}
				);

		}
		catch (error)
		{
			response.
				status(500).
				json(
					{
						message: `An unexpected error ocurred`,
						error: error.message
					}
				);
		}

	}
);

router.get(
	"/comment",
	async (request, response) =>
	{
		const service_id = request.query.service_id;
		const commented_by = request.query.commented_by;

		if (!(service_id || commented_by))
		{
			response.
				status(500).
				json({
					error: `Neither service ID (${service_id}) nor user ID (${commented_by}) is valid.`,
				});
			return;
		}

		try
		{
			const service_comment_result = await get_service_comment_with_service_user_IDs(
				service_id,
				commented_by
			);

			if (service_comment_result.status === "fail")
			{
				response.
					status(500).
					json(
						{
							message: `Could not get service comments for service ID - ${service_id}`,
							service_comment_result: service_comment_result
						}
					);

				return;
			}

			response.
				status(200).
				json(
					{
						message: `Successfully got service comments for service ID - ${service_id}`,
						service_comment_result: service_comment_result,
					}
				);

		}
		catch (error)
		{
			response.
				status(500).
				response(
					{
						message: `An unexpected error occured - Could not get comments for service ID - ${service_id}`,
						error: error.message
					}
				);
		}

	}
);

router.get(
	"/service-types",
	async (request, response) => 
	{
		const service_type_res_ = await get_all_service_types();

		if (service_type_res_ === "fail")
		{
			response.
				status(500).
				json(
					{
						message: `Could not get service types at the moment`,
						service_type_response: service_type_res_
					}
				);
			return;
		}

		response.
			status(200).
			json(
				{
					message: `Successfully got service types.`,
					service_type_response: service_type_res_
				}
			);

	}
);

module.exports = router;
