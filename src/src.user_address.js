const { find_objects_by_query } = require("../lib/lib.SFobjects");

const address_field_arr = [
	"Name",
	"user__r.Name",
	"user__r.user_name__c",
	"address__c",
	"address_title__c",
	"geolocation_latitude__c",
	"geolocation_longitude__c",
];

const get_user_addresses = async (user_id, title = "") =>
{
	const result = { status: "fail" };

	try
	{
		const query_ = `
			SELECT ${address_field_arr.join(', ')} 
			FROM user_addresses__c 
			WHERE user__r.Name = '${user_id}' 
				${
					(title)
					? " AND address_title__c = '" + title + "'"
					: ""
				}
		`;
		
		const user_address_res_ = await find_objects_by_query(query_, []);

		if(!user_address_res_.success)
		{
			result.message = `Could not get any addresses for user ID - ${user_id}`;
			return result;
		}

		result.address_result = user_address_res_.find_result;
		result.status = "success";

	}
	catch(error)
	{
		result.error = error.message;
	}

	return result;
}

module.exports = {
	get_user_addresses,
};
