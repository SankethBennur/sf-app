const {
	patch_object_record,
	find_objects_by_query,
	create_object_record
} = require("../lib/lib.SFobjects");

const service_status_default_field_arr = [
	"Name",
	"service__r.Name",
	"commented_by__r.Name",
	"commented_by__r.user_name__c",
	"commented_by__r.user_type__c",
	"comment__c",
	"commented_at__c",
];

const get_all_service_types = async () => 
{
	const result = { status: "fail" };

	try
	{
		const service_type_res_ = await find_objects_by_query(`
			SELECT service_type__c 
			FROM service_type__c 
		`, []);

		if(
			!(
				service_type_res_.success && 
				service_type_res_.find_result && 
				service_type_res_.find_result.records && 
				service_type_res_.find_result.records.length && 
				service_type_res_.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not find any service types at the moment. Please try again later.`;
			return result;
		}

		let service_rec_arr_ = [];

		for (let i=0 ; i < service_type_res_.find_result.records.length ; i++)
			service_rec_arr_.push(service_type_res_.find_result.records[i].service_type__c);

		result.service_types = service_rec_arr_;
		result.status = "success";

	}
	catch(error)
	{
		result.error = error.message;
	}

	return result;
}

async function update_service_status(service_id, target_status, agent_id)
{
	const result = { status: "fail" };

	if (!service_id)
	{
		result.message = "Service ID is invalid";
		return result;
	}

	try
	{
		// Get SF Id of service
		const service_result = await find_objects_by_query(`
			SELECT Id 
			FROM service__c 
			WHERE Name = '${service_id}' 
				AND agent__r.Name = '${agent_id}'
		`, []);

		if (
			!(
				service_result.success &&
				service_result.find_result &&
				service_result.find_result.records &&
				service_result.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not find service`;
			return result;
		}

		const __service_SF_Id = service_result.find_result.records[0]['Id'];

		const new_record_ = { service_status__c: target_status };

		if(target_status.toLowerCase() === "completed")
			// new_record_.completed_date_time__c = (new Date()).toISOString();
			new_record_.completed_date_time__c = new Date();

		const service_status_update_result = await patch_object_record(
			"service__c",
			__service_SF_Id,
			new_record_
		);

		result.service_status_update_result = service_status_update_result;

		if (service_status_update_result.status = "success") result.status = "success";

	}
	catch (error)
	{
		console.log(error.message)
		result.error = error.message;
	}

	return result;

}

async function add_service_comment(service_id, commented_by, comment)
{
	const result = { status: "fail" };

	if (!service_id)
	{
		result.message = "Service ID is invalid";
		return result;
	}

	try
	{
		// Get service SF Id
		const service_result = await find_objects_by_query(`
			SELECT Id 
			FROM service__c 
			WHERE Name = '${service_id}'
		`, []);

		if (
			!(
				service_result.success &&
				service_result.find_result &&
				service_result.find_result.records &&
				service_result.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not find service for service ID - ${service_id}`;
			return result;
		}

		const service_SF_Id = service_result.find_result.records[0]['Id'];

		// Get user SF Id
		const user_result = await find_objects_by_query(`
			SELECT Id 
			FROM user__c 
			WHERE Name = '${commented_by}'
		`, []);

		if (
			!(
				user_result.success &&
				user_result.find_result &&
				user_result.find_result.records &&
				user_result.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not find user for user ID - ${commented_by}`;
			return result;
		}

		const user_SF_Id = user_result.find_result.records[0]['Id'];

		// Validate if user is associated with service
		// As an agent/customer (Query to check if userID in agent__c or customer__c)
		// Admins may have privilege to comment on any service (Query to check if user is an admin)

		const service_comment_create_result = await create_object_record(
			"service_status__c",
			{
				service__c: service_SF_Id,
				commented_by__c: user_SF_Id,
				comment__c: comment,
				// commented_at__c: (new Date()).toISOString(),
				commented_at__c: new Date(),
			}
		);
		result.service_comment_create_result = service_comment_create_result;

		if (service_comment_create_result.success)
			result.status = "success";

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;

}

async function get_service_comment_with_service_user_IDs(service_id, commented_by)
{
	const result = { status: "fail" };

	try
	{
		if( !( service_id || commented_by ) )
		{
			result.message = `Neither service ID - ${service_id} nor user ID - ${commented_by} is valid.`;
			return result;
		}

		const condition_list_ = [];

		if (service_id) condition_list_.push(`service__r.Name = '${service_id}'`)
		if (commented_by) condition_list_.push(`commented_by__r.Name = '${commented_by}'`);

		const condition_query_ = condition_list_.join(' AND ');

		// Generate service query
		const service_comment_query = `
			SELECT ${service_status_default_field_arr.join(', ')} 
			FROM service_status__c 
			WHERE ${condition_query_}
		`;

		const service_comment_result = await find_objects_by_query(service_comment_query, []);
		result.service_comment_result = service_comment_result.find_result;

		// Validate service response
		if (
			service_comment_result.success &&
			service_comment_result.find_result &&
			service_comment_result.find_result.records &&
			service_comment_result.find_result.records.length > 0
		) result.status = "success";

	}
	catch (error)
	{
		result.error = error.message;
	}

	return result;
}

const get_sevice_type_SF_Id = async (service_type) =>
{
	const result = { status: "fail" };

	try
	{
		const query_ = `
			SELECT Id 
			FROM service_type__c 
			WHERE service_type__c = '${service_type}'
		`;

		const service_type_res_ = await find_objects_by_query(query_, []);

		if(
			!(
				service_type_res_.success && 
				service_type_res_.find_result && 
				service_type_res_.find_result.records && 
				service_type_res_.find_result.records[0] && 
				service_type_res_.find_result.records[0].Id
			)
		)
		{
			result.message = `Could not get service type SF Id.`;
			return result;
		}

		result.service_SF_id = service_type_res_.find_result.records[0].Id;
		result.status = "success";
	}
	catch(error)
	{
		result.error = error.message;
	}

	return result;
}

module.exports = {
	get_all_service_types,
	update_service_status,
	add_service_comment,
	get_service_comment_with_service_user_IDs,
	get_sevice_type_SF_Id,
};
