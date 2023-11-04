const {
	create_object_record,
	get_SF_Id_arr_for_object_IDs,
	find_objects_by_query
} = require("../lib/lib.SFobjects");

const { send_notification_to_user } = require("../utils/utils.push_notifications");

const register_token_for_user = async (user_id, token) =>
{
	const result = { status: "fail" };

	try
	{
		const user_SF_Id_arr_ = await get_SF_Id_arr_for_object_IDs("user__c", [user_id]);

		if( !(user_SF_Id_arr_[0] && user_SF_Id_arr_[0]["Id"]) )
		{
			result.message = `Could not get user ID - ${user_id} at this time.`;
			return result;
		}

		const user_SF_Id_ = user_SF_Id_arr_[0]["Id"];

		const register_user_token_res_ = await create_object_record(
			"user_push_notification__c", 
			{
				"user_ref__c": user_SF_Id_,
				"token__c": token,
			}
		);
		
		if( !register_user_token_res_.success )
		{
			result.message = `Unable to register device for user ID - '${user_id}'`;
			return result;
		}

		result.status = "success";
		result.register_user_token_res = register_user_token_res_;

		return result;

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;

};

const get_token_for_user = async (user_id) =>
{
	const result = { status: "fail" };

	try
	{
		const token_query_ = `
			SELECT token__c 
			FROM user_push_notification__c 
			WHERE user_ref__r.Name = '${user_id}'
			LIMIT 1
		`;

		const user_token_res_= await find_objects_by_query(token_query_, []);

		if(
			!(
				user_token_res_.success &&
				user_token_res_.find_result &&
				user_token_res_.find_result.records &&
				user_token_res_.find_result.records.length &&
				user_token_res_.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not get token for user ID - ${user_id}`;
			return result;
		}

		result.status = "success";
		result.user_token_result = user_token_res_.find_result;

	}
	catch (error)
	{
		result.error = error.message;
	}

	return result;

};

const send_push_notification_to_user = async (user_id, message) =>
{
	const result = { status: "fail" };

	try
	{
		const token_res_ = await get_token_for_user(user_id);

		if( 
			!(
				token_res_.status === "success" &&
				token_res_.user_token_result &&
				token_res_.user_token_result.records &&
				token_res_.user_token_result.records[0] &&
				token_res_.user_token_result.records[0].token__c
			)
		)
		{
			result.message = `Could not get token for user ID ${user_id}`;
			return result;
		}

		const token_ = token_res_.user_token_result.records[0].token__c;

		const send_notif_res_ = await send_notification_to_user(user_id, token_, message);

		if( !send_notif_res_.success )
		{
			result.message = `Could not send notification to user ID - ${user_id}`;
			return result;
		}

		result.status = "success";
		result.push_notification_result = send_notif_res_;

	}
	catch (error)
	{
		result.error = error.message;
		console.log(error.message);
	}

	return result;

};

module.exports = {
	register_token_for_user,
	get_token_for_user,
	send_push_notification_to_user,
};
