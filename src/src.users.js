const CryptoJS = require("crypto-js");

const {
	find_objects_by_query,
	patch_object_record,
	create_object_record
} = require("../lib/lib.SFobjects");

const {
	is_email_registered,
	validate_date_time_for_duration
} = require("../lib/lib.validation");

const {
	validate_email_OTP,
	send_email_OTP
} = require("../utils/utils.user_validation");

const user_field_arr = [
	"Name",
	"user_name__c",
	"full_name__c",
	"user_type__c",

	"email__c",
	"phone_number__c",
	"verified_email__c",
	"verified_phone__c",
	
	"password__c",
	"registered__c",
	"user_type__c",
	"profile_pic_URL__c",

	"status__c",
	"address__c",
	"geolocation_latitude__c",
	"geolocation_longitude__c",
];

async function find_users_by_user_IDs(user_id_list, field_name_list)
{
	const result = { status: "fail" };

	if (
		user_id_list.length <= 0 ||
		field_name_list.length <= 0
	)
	{
		let __err_msg = "Empty user_ID or field_names list";

		__err_msg = (user_id_list.length <= 0) ? "Empty User ID list" : __err_msg;

		__err_msg = (field_name_list.length <= 0) ? "Empty field names list" : __err_msg;

		__err_msg = (user_id_list.length <= 0 && field_name_list.length <= 0) ?
			"Empty user_ID and field_names list" :
			__err_msg;

		result.error = __err_msg;
		return result;
	}

	try
	{
		const query = `
			SELECT ${field_name_list.join(', ')} 
			FROM user__c 
			WHERE Name IN ('${user_id_list.join("', '")}')
		`;

		const query_result = await find_objects_by_query(query, []);

		if (
			query_result.success &&
			query_result.find_result &&
			query_result.find_result.records &&
			query_result.find_result.records.length &&
			query_result.find_result.records.length > 0
		)
		{
			result.status = "success";
			result.find_result = query_result.find_result;
		}

	}
	catch (error)
	{
		result.error = error.message;
	}

	return result;

}

async function validate_user_registration_by_email_password(email, password)
{
	const result = { status: "fail" };

	const field_arr_ = [
		`Name`,
		`full_name__c`,
		`user_name__c`,
		`user_type__c`,
		`email__c`,
		`password__c`,
		`phone_number__c`,
		`address__c`,
		`profile_pic_URL__c`,
		`geolocation_latitude__c`,
		`geolocation_longitude__c`
	];

	try
	{
		const query_ = `
			SELECT ${field_arr_.join(", ")} 
			FROM user__c 
			WHERE email__c = '${email}' 
				AND registered__c = true 
			LIMIT 1
		`;

		const user_result = await find_objects_by_query(query_, []);

		if (
			!(
				user_result.success &&
				user_result.find_result &&
				user_result.find_result.records &&
				user_result.find_result.records[0]
			)
		)
		{
			result.message = "Could not validate user";
			result.email_result = "Email is invalid / user not registered.";
			return result;
		}

		// decrypt password
		const pwd_bytes_ = CryptoJS.AES.decrypt(
			user_result.find_result.records[0].password__c,
			process.env.AUTH_SECRET
		);

		if(!pwd_bytes_)
		{
			result.message = "Could not validate user";
			result.login_result = "Could not validate password";
			return result;
		}

		const user_pwd_ = pwd_bytes_.toString(CryptoJS.enc.Utf8);

		if(password != user_pwd_)
		{
			result.message = "Could not validate user";
			result.login_result = "Password is invalid";
			return result;
		}

		delete user_result.find_result.records[0].password__c;
		result.user_result = user_result;
		result.status = "success";

	}
	catch (error)
	{
		result.error = error.message;
	}

	return result;

}

async function update_user_details(user_id, new_values)
{
	const result = { status: "fail" };

	if (!user_id)
	{
		result.message = `Invalid user ID - ${user_id}`;
		return result;
	}

	if (!new_values)
	{
		result.message = `Invalid values to update`;
		return result;
	}

	try
	{
		let update_user_SF_Id = "";

		// Get user SF Id
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
				user_result.find_result.records &&
				user_result.find_result.records.length > 0
			)
		)
		{
			result.message = `Unable to find user with user ID - ${user_id}`;
			result.status_code = 404;
			return result;
		}

		update_user_SF_Id = user_result.find_result.records[0]["Id"];

		// Patch new values using user SF Id
		const update_result = await patch_object_record(
			"user__c",
			update_user_SF_Id,
			new_values
		);

		result.update_result = update_result;

		// Validate result
		if (update_result.success) result.status = "success";

	}
	catch (error)
	{
		result.error = error.message;
	}

	return result;

}

async function get_user_details(user_id_arr, only_registered = true)
{
	const result = { status: "fail" };

	if (user_id_arr.length <= 0)
	{
		result.message = `Invalid list of users.`;
		return result;
	}

	try
	{
		const user_fields_ = [
			`Name`,
			`user_name__c`,
			`user_type__c`,
			`full_name__c`,
			// `email__c`,
			`phone_number__c`,
			`address__c`,
			`profile_pic_URL__c`,
			`geolocation_latitude__c`,
			`geolocation_longitude__c`
		].join(', ');


		const user_query_ = `
			SELECT ${user_fields_} 
			FROM user__c 
			WHERE Name IN ('${user_id_arr.join("', '")}')
				${(only_registered) ? "AND registered__c = true" : ""}
		`;

		const user_result_ = await find_objects_by_query(user_query_, []);

		if (
			!(
				user_result_.find_result &&
				user_result_.find_result.records &&
				user_result_.find_result.records.length &&
				user_result_.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not find any of the users among ${user_id_arr.join(', ')}`;
			return result;
		}

		result.user_result = user_result_.find_result;
		result.status = "success";

	}
	catch (error)
	{
		console.log(error.message);

		result.error = error.message;
		return result;
	}

	return result;
}

const register_user_with_email_otp = async (email, otp) =>
{
	result = { status: "fail" };

	try
	{
		// Verify if email already registered
		if (await is_email_registered(email))
		{
			result.message = `User is already registered`;
			return result;
		}

		// Validate OTP
		const otp_res_ = await validate_email_OTP(email, otp, `user_registration`);

		if (!otp_res_.success)
		{
			result.otp_result = otp_res_;
			result.message = `Could not validate OTP for email - ${email}`;
			return result;
		}

		// find user for SF Id
		const user_id_res_ = await find_objects_by_query(`
			SELECT Id 
			FROM user__c 
			WHERE email__c = '${email}'
			LIMIT 1
		`, []);

		if (
			!(
				user_id_res_.success &&
				user_id_res_.find_result &&
				user_id_res_.find_result.records &&
				user_id_res_.find_result.records[0]
			)
		)
		{
			result.message = `User not found. Did the user sign in?`;
			return result;
		}

		// Patch user record as registered
		const patch_result_ = await patch_object_record(
			"user__c",
			user_id_res_.find_result.records[0].Id,
			{
				registered__c: true,
			}
		);

		if (!patch_result_.success)
		{
			result.message = `Could not mark user as registered.`;
			return result;
		}

		result.status = "success";

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;

}

const find_users_by_email_ID_arr = async (email_arr) =>
{
	const result = {};

	if (email_arr.length <= 0)
	{
		result.error = `Invalid list of emails.`;
		return result;
	}

	try
	{
		const user_fields_ = [
			`Id`,
			`Name`,
			`full_name__c`,
			`user_name__c`,
			`user_type__c`,
			`email__c`,
			`phone_number__c`,
			`address__c`,
			`profile_pic_URL__c`,
			`geolocation_latitude__c`,
			`geolocation_longitude__c`
		].join(', ');


		const user_query_ = `
			SELECT ${user_fields_} 
			FROM user__c 
			WHERE email__c IN ('${email_arr.join("', '")}')
		`;

		const user_result_ = await find_objects_by_query(user_query_, []);

		if (
			!(
				user_result_.success &&
				user_result_.find_result &&
				user_result_.find_result.records &&
				user_result_.find_result.records.length &&
				user_result_.find_result.records.length > 0
			)
		)
		{
			result.error = `Could not find any of the users among ${email_arr.join(', ')}`;
			return result;
		}

		result.user_result = user_result_.find_result;
		result.success = true;

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;
}

const check_and_send_email_otp_for_sign_up = async (email, user_SF_record) =>
{
	result = {};

	try
	{
		//	Find existing OTP for same purpose if validated
		const otp_res_ = await find_objects_by_query(`
			SELECT Id, current_OTP__c, for_user__c, generated_date_time__c, otp_validated__c, purpose_OTP__c
			FROM user_OTP_status__c 
			WHERE for_user__r.email__c = '${email}' 
				AND purpose_OTP__c = 'user_registration' 
			LIMIT 1
		`, []);

		// if no otp record found
		if (
			!(
				otp_res_.success &&
				otp_res_.find_result &&
				otp_res_.find_result.records &&
				otp_res_.find_result.records[0]
			)
		)
		{
			//	create new OTP_status record(generate_OTP number)
			//	send_email_OTP
			send_email_OTP("user_registration", email, user_SF_record["Id"], "");
			// 	return result
			result.success = true;
			return result;
		}

		const otp_record_ = otp_res_.find_result.records[0];

		//If validated,
		if (otp_record_.otp_validated__c)
		{
			//	Query for user using email

			// 	if(user__r.registered__c)
			if (user_SF_record.registered__c)
			{
				result.message = `User is already registered.`;
				return result;
			}

			//	* else user is still not registered, their record may still exist
			//	(asnyc) patch existing OTP_status record {validated = false}
			patch_object_record("user_OTP_status__c", otp_record_["Id"], { "otp_validated__c": false });
			//	create new OTP_status record(generate_OTP number)
			//	send_email_OTP
			send_email_OTP("user_registration", email, user_SF_record["Id"], "");

			result.success = true;
			return result;
		}

		//* else OTP is not yet validated.
		//* 2 scenarios here, time is expired, or not
		//if(time expired)
		if (validate_date_time_for_duration(
			new Date(otp_record_.generated_date_time__c),
			new Date(),	// date 2 is the newer date
			10 * 60		// duration in seconds ; hence, minutes * 60 seconds
		))
			// * time not expired
			// * no creation of record or generation of OTP
			//	Send same OTP
			send_email_OTP("user_registration", email, user_SF_record["Id"], otp_record_.current_OTP__c);

		//	* it is still not valiated, and has been expired.
		//	create new OTP_status record(generate_OTP number)
		//	send_email_OTP
		else send_email_OTP("user_registration", email, user_SF_record["Id"], "");

		result.success = true;

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;

}

const sign_up_user_with_email = async (email, new_user) =>
{
	const result = { status: "fail" };

	let user_result_ = {};
	let user_record_ = {};

	try
	{
		if (await is_email_registered(email))
		{
			result.message = `User with email ID - ${email} is already registered.`;
			return result;
		}

		//Find the user record (here, un-registered)
		user_result_ = await find_users_by_email_ID_arr([email]);

		//if not found,
		if (
			!(
				user_result_.success &&
				user_result_.user_result &&
				user_result_.user_result.records &&
				user_result_.user_result.records[0]
			)
		)
		{
			//	create user record
			user_result_ = await create_object_record("user__c", new_user);
			//	* this is where you will need new_user details
			//	validate created user
			if (!user_result_.success)
			{
				result.message = `Could not create new user for the email - ${email}`;
				return result;
			}

			user_result_ = await find_users_by_email_ID_arr([email]);

			if (
				!(
					user_result_.success &&
					user_result_.user_result &&
					user_result_.user_result.records &&
					user_result_.user_result.records[0]
				)
			)
			{
				result.message = `Could not find or create user for the email - ${email}`;
				return result;
			}

		}

		user_record_ = user_result_.user_result.records[0];

		//await check_and_send_email_otp_for_sign_up
		const send_email_otp_res_ = await check_and_send_email_otp_for_sign_up(email, user_record_);

		//if send_email_OTP failed
		if (!send_email_otp_res_.success)
		{
			result.message = `Could not send OTP for the email - ${email} `;
			return result;
		}

		result.status = "success";
		return result;

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;
}

module.exports = {
	find_users_by_user_IDs,
	update_user_details,
	validate_user_registration_by_email_password,
	get_user_details,
	register_user_with_email_otp,
	sign_up_user_with_email,
};
