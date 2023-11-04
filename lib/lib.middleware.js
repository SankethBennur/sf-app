const { find_objects_by_query } = require("./lib.SFobjects");

const { get_user_details } = require("../src/src.users");

const validate_user_id_registered = () =>
{
	return async (request, response, next) =>
	{
		const user_id_ = request.query.user_id;

		if (!user_id_)
		{
			response.
				status(500).
				json(
					{
						error: `Invalid user ID - ${user_id_}`
					}
				);
			return;
		}

		const user_res_ = await get_user_details([user_id_], true);

		if (
			!(
				user_res_.status === "success" &&
				user_res_.user_result &&
				user_res_.user_result.records &&
				user_res_.user_result.records[0]
			)
		)
		{
			response.
				status(500).
				json(
					{
						error: `User - ${user_id_} is not yet registered.`,
					}
				);
			return;
		}

		next();

	}
}

const validate_existing_OTP_for_user = (comm_type, purpose_of_OTP) =>
{
	return async (request, response, next) =>
	{
		const comm_type_ = (comm_type === "email")
			? `for_user__r.email__c = '${request.body.email}' `
			: `for_user__r.phone_number__c = '${request.body.phone_num}' `

		const user_result = await find_objects_by_query(`
			SELECT Name 
			FROM user_OTP_status__c 
			WHERE ${comm_type_}
				AND purpose_OTP__c = '${purpose_of_OTP}' 
			LIMIT 1
		`, []);

		if (
			user_result.success &&
			user_result.find_result &&
			user_result.find_result.records &&
			user_result.find_result.records[0]
		)
		{
			response.
				status(500).
				json(
					{
						message: `OTP already sent to email - ${user_result.find_result.records[0]["email__c"]} for ${user_result.find_result.records[0]["purpose_OTP__c"].split('_').join(' ')}.`,
					}
				);

			return;
		}

		next();

	}
}

const validate_http_queries = (query_arr) =>
{
	return async (request, response, next) =>
	{
		let __query_check = true;
		let __missing_query = "";

		query_arr.forEach((qkey) =>
		{
			if (__query_check && !request.query[qkey])
			{
				__query_check = false;
				__missing_query = qkey;
				return;
			}
		});

		if (__query_check)
		{
			next();
			return;
		}

		response.
			status(500).
			json(
				{
					"message": `${__missing_query} is missing from HTTP request queries.`,
				}
			);

	};
};

const validate_http_body_arguments = (body_arg_arr) =>
{
	return async (request, response, next) =>
	{
		let __body_arg_check = true;
		let __missing_body_arg = "";

		body_arg_arr.forEach((qkey) =>
		{
			if (__body_arg_check && !request.body[qkey])
			{
				__body_arg_check = false;
				__missing_body_arg = qkey;
				return;
			}
		});

		if (__body_arg_check)
		{
			next();
			return;
		}

		response.
			status(500).
			json(
				{
					"message": `${__missing_body_arg} is missing from HTTP request body parameters.`,
				}
			);

	};
};

module.exports = {
	validate_http_queries,
	validate_http_body_arguments,
	validate_existing_OTP_for_user,
	validate_user_id_registered,
};
