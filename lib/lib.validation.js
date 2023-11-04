const { find_objects_by_query } = require("./lib.SFobjects");

const accepted_file_types = {
	"invoice": ["xlsx"],
	"extended-warranty": ["pdf"],
	"product-image": ["jpg", "jpeg", "png"],
	"profile-picture": ["jpg", "jpeg", "png"],
};

const file_directory = {
	"invoice": `./assets/invoice/`,
	"extended-warranty": `./assets/extended-warranty/`,
	"product-image": `./assets/product-images/`,
	"profile-picture": "./assets/user/profile-images/",
};

// =================

const validate_file_extension_for_upload_type = (extension, upload_type) =>
{
	if (!accepted_file_types[upload_type])
		return false;

	return accepted_file_types[upload_type].includes(extension);

}

const get_file_type_directory = (extension, upload_type) => 
{
	if (!validate_file_extension_for_upload_type(extension, upload_type)) return "";

	if (!(file_directory[upload_type])) return "";

	return file_directory[upload_type];

}

// May have to be re-factored and removed from here
const is_email_registered = async (email) =>
{
	const user_result = await find_objects_by_query(`
		SELECT Id 
		FROM user__c 
		WHERE email__c = '${email}' 
			AND registered__c = true 
		LIMIT 1
	`, []);

	return (
		user_result.success &&
		user_result.find_result &&
		user_result.find_result.records &&
		user_result.find_result.records[0]
	)
		? true
		: false;

}

const validate_date_time_for_duration = (date_time_1, date_time_2, duration_in_seconds) =>
{
	const date_time_1_ = new Date(date_time_1);
	const date_time_2_ = new Date(date_time_2);

	return (
		(date_time_1_ < date_time_2_) &&
		(date_time_2_ - date_time_1_) < (duration_in_seconds * 1000)
	);
}

module.exports = {
	validate_file_extension_for_upload_type,
	get_file_type_directory,
	is_email_registered,
	validate_date_time_for_duration,
};
