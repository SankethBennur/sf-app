const express = require("express");
const router = express.Router();

const { multer_upload } = require("../utils/utils.file_upload");

const { create_object_record, find_objects_by_query } = require("../lib/lib.SFobjects");

const { validate_http_queries } = require("../lib/lib.middleware");


router.post(
	"/",
	validate_http_queries(["user_id", "file_type"]),
	multer_upload.single("file"),
	async (request, response) => {
		const user_id = request.query.user_id;
		const file_type = request.query.file_type;

		try
		{
			if (!request.file)
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

			// get user__c SF Id from user_id
			const user_result = await find_objects_by_query(`
				SELECT Id 
				FROM user__c 
				WHERE Name = '${user_id}'
			`, []);

			if (
				!(
					user_result.success &&
					user_result.find_result &&
					user_result.find_result.records &&
					user_result.find_result.records.length > 0 &&
					user_result.find_result.records[0]["Id"]
				)
			)
			{
				response.
					status(404).
					json(
						{
							message: `Could not find user of user ID - ${user_id}`,
						}
					);

				return;
			}

			const user_SF_Id = user_result.find_result.records[0]["Id"];

			// Add new record into user_uploads Object
			const upload_result = await create_object_record(
				"user_uploads__c",
				{
					file_URL__c: request.file.path,
					upload_file_type__c: file_type,
					user__c: user_SF_Id,
				}
			);

			// Validate patch operation
			if (!upload_result.success)
			{
				response.
					status(400).
					json(
						{
							message: "Could not save uploaded file.",
							upload_result: upload_result,
						}
					);

				return;
			}

			response.
				status(200).
				json(
					{
						message: "Successfully uploaded file.",
						upload_result: upload_result,
					}
				);

		}
		catch (error)
		{
			console.log(error.message);

			response.
				status(500).
				json(
					{
						message: "An unexpected error ocurred.",
						error: error.message,
					}
				);
		}
	});

module.exports = router;
