const dotenv = require("dotenv");
if (dotenv) dotenv.config();

const { send_email, make_email_html_otp } = require("./utils.mailer");

const { generate_OTP } = require("../lib/lib.generator");

const { validate_date_time_for_duration } = require("../lib/lib.validation");

const {
	create_object_record,
	find_objects_by_query,
	patch_object_record
} = require("../lib/lib.SFobjects");

/*
	- Must create a class for the following functions.
	- The class will contain properties such as
*/

async function send_email_OTP(purpose_of_OTP, email, user_SF_Id, otp)
{
	const result = {};
	let current_OTP_ = "";

	try
	{
		if (
			!(
				otp &&
				otp.length &&
				otp.length === 4
			)
		)
		{
			current_OTP_ = generate_OTP(4);

			// create record in user_OTP object
			const OTP_obj_ = {
				for_user__c: user_SF_Id,
				purpose_OTP__c: purpose_of_OTP,
				current_OTP__c: current_OTP_,
				generated_date_time__c: new Date(),
				otp_validated__c: false,
			};

			create_object_record("user_OTP_status__c", OTP_obj_);

		}
		else
			current_OTP_ = otp;

		// create mail options
		const mail_options_ = {
			from: process.env.SENDER_EMAIL,
			to: email,
			subject: `OTP Verification for ${purpose_of_OTP.split('_').join(' ')}`,
			html: make_email_html_otp("./assets/otp-validation.html", current_OTP_),
		};

		// send email
		send_email(mail_options_);

		result.success = true;

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;
}

async function validate_email_OTP(email, otp, purpose_of_OTP)
{
	const result = { };

	try
	{
		const otp_res_ = await find_objects_by_query(`
			SELECT Id, generated_date_time__c 
			FROM user_OTP_status__c 
			WHERE for_user__r.email__c = '${email}'
				AND current_otp__c = '${otp}' 
				AND purpose_OTP__c = '${purpose_of_OTP}' 
			LIMIT 1
		`, []);
		
		if(
			!(
				otp_res_.success &&
				otp_res_.find_result &&
				otp_res_.find_result.records &&
				otp_res_.find_result.records[0]
			)
		)
		{
			result.error = `Could not find OTP for email - ${email} for ${purpose_of_OTP.split('_').join(' ')}. Please request new OTP.`;
			return result;
		}

		const otp_record_ = otp_res_.find_result.records[0];

		//If (registered) || (< duration time)
		if(
			(otp_record_.otp_validated__c) || 
			validate_date_time_for_duration(
				new Date(otp_record_.generated_date_time__c),
				new Date(),
				10 * 60
			)
		)
		{
			// success
			patch_object_record("user_OTP_status__c", otp_record_.Id, { otp_validated__c: true });
			result.success = true;
			return result;
		}
		
		result.error = `OTP validation exceeded 10 minutes duration.`;

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}
	
	return result;
}

module.exports = {
	send_email_OTP,
	validate_email_OTP
};
