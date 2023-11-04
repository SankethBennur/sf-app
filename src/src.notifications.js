const { create_object_record, find_objects_by_query, patch_object_record } = require("../lib/lib.SFobjects");

const { find_users_by_user_IDs } = require("./src.users");

const __notification_default_field_arr = [
	"Name",

	"user__r.Name",
	"user__r.user_name__c",
	"user__r.full_name__c",

	"user__r.email__c",
	"user__r.phone_number__c",
	"user__r.verified_email__c",
	"user__r.verified_phone__c",

	"user__r.profile_pic_URL__c",
	"user__r.status__c",
	"user__r.user_type__c",

	"user__r.address__c",
	"user__r.geolocation_latitude__c",
	"user__r.geolocation_longitude__c",

	"read__c",
	"subject__c",
	"message_body__c",
	"created_date_time__c",
];

const create_new_notification = async (user_id, subject, message, sf_id = false) =>
{
	const result = { status: "fail" };

	try
	{
		let user_SF_id_ = "";

		if (!sf_id)
		{
			const user_SF_Id_res_ = await find_users_by_user_IDs([user_id], ["Id"]);

			if (
				!(
					user_SF_Id_res_.status === "success" &&
					user_SF_Id_res_.find_result &&
					user_SF_Id_res_.find_result.records &&
					user_SF_Id_res_.find_result.records[0] &&
					user_SF_Id_res_.find_result.records[0]["Id"]
				)
			)
			{
				result.message = `Could not get user details for user - ${user_id}`;
				return result;
			}
			
			user_SF_id_ = user_SF_Id_res_.find_result.records[0]["Id"];
		}
		else
		{
			user_SF_id_ = user_id;
		}

		const new_notification_ = {
			user__c: user_SF_id_,
			subject__c: subject,
			message_body__c: message,
			// created_date_time__c: (new Date()).toISOString(),
			created_date_time__c: new Date(),
			read__c: false,
		};

		const create_notif_res_ = await create_object_record("user_notification__c", new_notification_);

		if (!create_notif_res_.success)
		{
			result.message = `Could not create notification for user - ${user_id}`;
			return result;
		}

		result.notification_result = create_notif_res_;
		result.status = "success";

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;
}

const get_notification_list = async (notification_id_list, user_id_list) =>
{
	const result = { status: "fail" };

	if (!(
		notification_id_list.length > 0 ||
		user_id_list.length > 0
	))
	{
		result.error = `Both notification list and user list are missing`;
		return result;
	}

	try
	{
		const conditions_ = [];

		if (notification_id_list.length && notification_id_list.length > 0)
			conditions_.push(`Name IN ('${notification_id_list.join("', '")}')`);

		if (user_id_list.length && user_id_list.length > 0)
			conditions_.push(`user__r.Name IN ('${user_id_list.join("', '")}')`);

		const query_ = `
			SELECT ${__notification_default_field_arr.join(", ")}
			FROM user_notification__c 
			WHERE ${conditions_.join(" AND ")}
		`;

		const notification_res_ = await find_objects_by_query(query_, []);

		if (
			!(
				notification_res_.success &&
				notification_res_.find_result &&
				notification_res_.find_result.records &&
				notification_res_.find_result.records.length &&
				notification_res_.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not find notifications of IDs - ${notification_id_list}`;
			return result;
		}

		result.notification_result = notification_res_.find_result;
		result.status = "success";

	}
	catch (error)
	{
		result.error = error.message;
	}

	return result;
}

const mark_read_notification = async (notification_id) =>
{
	const result = { status: "fail" };

	try
	{
		const notification_sf_id_res_ = await find_objects_by_query(`
			SELECT Id 
			FROM user_notification__c 
			WHERE Name = '${notification_id}'
		`, []);

		if (!(
			notification_sf_id_res_.success &&
			notification_sf_id_res_.find_result &&
			notification_sf_id_res_.find_result.records &&
			notification_sf_id_res_.find_result.records[0] &&
			notification_sf_id_res_.find_result.records[0]["Id"]
		))
		{
			result.message = `Could not find notification of ID - ${notification_id}`;
			return result;
		}

		const notif_sf_id = notification_sf_id_res_.find_result.records[0]["Id"];

		const notification_read_res_ = await patch_object_record(
			"user_notification__c",
			notif_sf_id,
			{
				read__c: true,
			}
		);

		if (!notification_read_res_.success)
		{
			result.message = `Could not mark notification ${notification_id} as read`;
			return result;
		}

		result.notification_read_result = notification_read_res_;
		result.status = "success";

	}
	catch (error)
	{
		result.error = error.message;
	}

	return result;
}

const mark_read_notification_list = async (notification_id_list) =>
{
	const result = { status: "fail" };

	if(!(
		notification_id_list && 
		notification_id_list.length && 
		notification_id_list.length > 0
	))
	{
		result.message = `Invalid notification ID list provided`;
		return result;
	}

	try
	{
		const failed_notification_list_ = [];

		for (let i = 0 ; i < notification_id_list.length ; i++)
		{
			let notif_id_ = notification_id_list[i];

			let read_res_ = await mark_read_notification(notif_id_);

			if(read_res_.status === "fail")
				failed_notification_list_.push(notif_id_);
		}

		if (failed_notification_list_.length > 0)
		{
			result.status = "partial success";
			result.message = `The following notification IDs could not be marked read`;
			result.failed_notification_list = failed_notification_list_;
			return result;
		}

		result.message = `Successfully marked all notifications as read`;
		result.status = "success";
	}
	catch (error)
	{
		result.error = error.message;
	}

	return result;
}

const make_notification_on_service_assignment = (
	user_type,
	service_id,
	service_start_date_time,
	service_status
) =>
{
	switch (user_type.toLowerCase().replace(/\s/g, ''))
	{
		case "agent":
			return({
				subject: "Service assigned to customer",
				message: `You have been assigned to service ID - "${service_id}". Please begin service by ${service_start_date_time}. Service status is now "${service_status}"`,
			});
		case "customer":
			return({
				subject: "Agent assigned for service",
				message: `You have been assigned an agent for service ID - "${service_id}". Agent will begin service by ${service_start_date_time}. Service status is now "${service_status}"`,
			});
		default:
			return(null);
	}
};



module.exports = {
	create_new_notification,
	get_notification_list,
	mark_read_notification,
	mark_read_notification_list,
	make_notification_on_service_assignment,
};
