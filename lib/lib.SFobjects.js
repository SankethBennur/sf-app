const sf_connection = require("../models/models.salesforce");

async function create_object_record(object_name, new_record, get_SF_Id = false)
{
	const result = {};

	try
	{
		const sf_conn = await sf_connection();
		const create_result_ = await sf_conn.sobject(String(object_name)).create(new_record);
		
		if(!get_SF_Id) delete create_result_["id"];
		result.create_result = create_result_;

		if (create_result_.success)
			result.success = true;
		
		return result;

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	result.message = `Could not create a record for "${object_name}" salesforce object`;
	return result;
}

async function find_objects_by_query(query, bind_variables)
{
	const result = { };

	try
	{
		const sf_conn = await sf_connection();
		const query_result = await sf_conn.query(query, bind_variables);

		if (
			!(
				query_result.records &&
				query_result.records.length &&
				query_result.records.length > 0
			)
		)
		{
			result.error = `Could not find records.`;
			return result;
		}

		result.success = true;

		for (let i = 0; i < query_result.records.length; i++)
			if (query_result.records[i].attributes)
				delete query_result.records[i].attributes;

		result.find_result = query_result;

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;
}

async function patch_object_record(object_name, SF_record_Id, new_values)
{
	const result = { };

	try
	{
		const sf_conn = await sf_connection();

		await sf_conn.sobject(object_name).update(
			{
				"Id": SF_record_Id,
				...new_values
			},
			async (error, response) =>
			{
				if (error || !response.success)
				{
					result.error = "Error while updating";
				}
				else
				{
					result.success = true;
					result.message = `Record updated successfully.`;
					delete response.id;
					result.result = response;
				}
			}
		);

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;

}

async function get_SF_Id_arr_for_object_IDs(object_name, object_ID_arr)
{
	let SF_Id_arr_ = [];

	try
	{
		const query_ = `
			SELECT Id 
			FROM ${object_name} 
			WHERE Name IN ('${object_ID_arr.join("', '")}')
		`;

		const find_res_ = await find_objects_by_query(query_, []);

		if(
			!(
				find_res_.success && 
				find_res_.find_result && 
				find_res_.find_result.records && 
				find_res_.find_result.records.length && 
				find_res_.find_result.records.length > 0
			)
		)
		{
			console.log(`No records found for IDs - ${object_ID_arr}`);
			return [];
		}

		SF_Id_arr_ = find_res_.find_result.records;

	}
	catch (error)
	{
		console.log(error.message);
		return [];
	}

	return SF_Id_arr_;

}

module.exports = {
	create_object_record,
	find_objects_by_query,
	patch_object_record,
	get_SF_Id_arr_for_object_IDs,
};
