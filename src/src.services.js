const { get_field_values_list } = require("../lib/lib.generator");

const {
	create_object_record,
	find_objects_by_query,
	patch_object_record,
} = require("../lib/lib.SFobjects");

const {
	find_users_by_user_IDs,
	get_user_details
} = require("./src.users");

const {
	find_products_by_product_IDs,
	find_products_by_brand_category_subcategory
} = require("./src.products");

const { get_sevice_type_SF_Id } = require("./src.service_status");

async function initiate_service(customer_id, product_id, type_of_service, requirement_details, preferred_start_date_time)
{
	const result = { status: "fail" };

	try
	{
		// get customer SF Id
		const customer_result_ = await find_users_by_user_IDs([customer_id], ['Id']);

		// Validate customer record
		if (
			!(
				customer_result_.status === "success" &&
				customer_result_.find_result &&
				customer_result_.find_result.records &&
				customer_result_.find_result.records.length &&
				customer_result_.find_result.records.length > 0 &&
				customer_result_.find_result.records[0]
			)
		)
		{
			result.message = `Could not get customer details for customer ID - ${customer_id}`;
			return result;
		}

		const customer_Id_list_ = get_field_values_list(customer_result_.find_result.records, 'Id');

		// get product SF Id
		const product_result_ = await find_products_by_product_IDs([product_id], ['Id']);

		// Validate product record
		if (
			!(
				product_result_.status === "success" &&
				product_result_.product_result &&
				product_result_.product_result.records &&
				product_result_.product_result.records.length &&
				product_result_.product_result.records.length > 0 &&
				product_result_.product_result.records[0]
			)
		)
		{
			result.message = `Could not get product details for product ID - ${product_id}`;
			return result;
		}

		const product_Id_list_ = get_field_values_list(product_result_.product_result.records, 'Id');

		// service type
		const service_type_SF_id_res_ = await get_sevice_type_SF_Id(type_of_service);

		if(
			!(
				service_type_SF_id_res_.status === "success" && 
				service_type_SF_id_res_.service_SF_id
			)
		)
		{
			result.message = `Could not get service type information for service - ${type_of_service}`;
			return result;
		}

		const new_service_ = {
			"customer__c": customer_Id_list_[0],
			"product__c": product_Id_list_[0],
			"type_of_service__c": service_type_SF_id_res_.service_SF_id,
			"requirement_details__c": requirement_details,
			"service_status__c": "Created",
			// "request_date_time__c": (new Date()).toISOString(),
			"request_date_time__c": new Date(),
			"preferred_date_time__c": (!preferred_start_date_time)
				? ""
				// : (new Date(preferred_start_date_time)).toISOString()
				: new Date(preferred_start_date_time)
		}

		const create_result_ = await create_object_record("service__c", new_service_);

		result.create_result = create_result_;

		if (!create_result_.success)
		{
			result.message = `Could not create service for customer - '${customer_id} and product - '${product_id}'.`;
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

async function get_services(condition)
{
	if (!condition) return [];

	const customer_fields_ = [
		`customer__r.Name`,
		`customer__r.user_name__c`,
		`customer__r.full_name__c`,
		`customer__r.user_type__c`,
		// `customer__r.email__c`,
		`customer__r.phone_number__c`,
		`customer__r.address__c`,
		`customer__r.profile_pic_URL__c`,
		"customer__r.geolocation_latitude__c",
		"customer__r.geolocation_longitude__c"
	].join(', ');

	const agent_fields_ = [
		`agent__r.Name`,
		`agent__r.user_name__c`,
		`agent__r.full_name__c`,
		`agent__r.user_type__c`,
		// `agent__r.email__c`,
		`agent__r.phone_number__c`,
		`agent__r.address__c`,
		`agent__r.profile_pic_URL__c`,
		"agent__r.geolocation_latitude__c",
		"agent__r.geolocation_longitude__c"
	].join(', ');

	const product_fields_ = [
		"product__r.Name",
		"product__r.product_name__c",
		"product__r.product_image_url__c",
		"product__r.product_description__c",
	].join(', ');

	const all_fields_ = [
		"Name",
		customer_fields_,
		agent_fields_,
		product_fields_,
		"service_status__c",
		"type_of_service__r.service_type__c",
		"request_date_time__c",
		"start_service_date_time__c",
		"requirement_details__c",
		"completed_date_time__c"
	].join(', ');

	const service_query_ = `
		SELECT ${all_fields_} 
		FROM service__c 
		WHERE ${condition}
	`;

	const service_result = await find_objects_by_query(service_query_, []);

	if (
		!(
			service_result.success &&
			service_result.find_result &&
			service_result.find_result.records &&
			service_result.find_result.records.length &&
			service_result.find_result.records.length > 0
		)
	)
		return [];

	return service_result.find_result.records;

}

async function track_services(service_id_list)
{
	const result = { status: "fail" };

	if (service_id_list.length <= 0)
	{
		let __err_msg = "Empty service ID list";
		result.error = __err_msg;
		return result;
	}

	try
	{
		const service_arr_ = await get_services(`Name IN ('${service_id_list.join("', '")}')`);

		if (service_arr_.length <= 0)
		{
			result.message = `Could not find any of the service IDs - '${service_id_list.join("', '")}'. `;
			return result;
		}

		result.status = "success";
		result.length = service_arr_.length;
		result.service_records = service_arr_;
		return result;

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;

}

async function find_services_for_brand_id(brand_id)
{
	const result = { status: "fail" };

	if (!brand_id)
	{
		result.error = "Invalid Brand ID";
		return result;
	}

	try
	{
		// get product SF Ids for brand_id
		const product_result = await find_products_by_brand_category_subcategory(
			brand_id,
			"",
			"",
			['Id']
		);

		// If no product has been fetched
		if (
			!product_result.product_result ||
			!product_result.product_result.records ||
			product_result.product_result.records.length < 0
		)
		{
			// send fail result
			result.message = "Could not get any products.";
			return result;
		}

		const product_Id_list = get_field_values_list(product_result.product_result.records, 'Id');

		// Query for all services records using the Product SF Ids
		const query = `
			SELECT Name, service_status__c, request_date_time__c, start_service_date_time__c 
			FROM service__c 
			WHERE product__c IN ('${product_Id_list.join("', '")}')
		`;

		const service_result = await find_objects_by_query(query, []);
		result.service_result = service_result.find_result;

		if (
			service_result.find_result.success &&
			service_result.find_result.records &&
			service_result.find_result.records.length &&
			service_result.find_result.records.length > 0
		)
			result.status = "success";

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;
}

async function find_services_for_product_id(product_id)
{
	const result = { status: "fail" };

	if (!product_id)
	{
		result.error = "Invalid Brand ID";
		return result;
	}

	try
	{
		// get product SF Ids for brand_id
		const product_result = await find_products_by_product_IDs([product_id], ['Id']);

		// If no product has been fetched
		if (
			!(
				product_result.status === "success" &&
				product_result.product_result &&
				product_result.product_result.records &&
				product_result.product_result.records.length &&
				product_result.product_result.records.length > 0
			)
		)
		{
			// send fail result
			result.message = "Could not get any products.";
			return result;
		}

		const product_Id_list = get_field_values_list(product_result.product_result.records, 'Id');

		// Query for all services records using the Product SF Ids
		const query = `
			SELECT Name, service_status__c, start_service_date_time__c, request_date_time__c 
			FROM service__c 
			WHERE product__c IN ('${product_Id_list.join("', '")}')
		`;

		const service_result = await find_objects_by_query(query, []);
		result.service_result = service_result.find_result;

		if (
			service_result.find_result.success &&
			service_result.find_result.records &&
			service_result.find_result.records.length &&
			service_result.find_result.records.length > 0
		)
			result.status = "success";

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;
}

async function assign_agent_by_id(service_id, agent_id, start_service_date_time, admin_id)
{
	const result = { status: "fail" };

	try
	{
		// Get Services SF Id
		const service_ID_result_ = await find_objects_by_query(`
			SELECT Id 
			FROM service__c 
			WHERE Name = '${service_id}' 
			LIMIT 1
		`, []);

		// Validate Services SF Id
		if (
			!(
				service_ID_result_.success &&
				service_ID_result_.find_result &&
				service_ID_result_.find_result.records &&
				service_ID_result_.find_result.records.length > 0 &&
				service_ID_result_.find_result.records[0] &&
				service_ID_result_.find_result.records[0]["Id"]
			)
		)
		{
			result.message = "Service not found";
			return result;
		}

		const service_SF_Id_ = service_ID_result_.find_result.records[0]["Id"];

		// Get user details
		const user_result_ = await get_user_details([agent_id, admin_id]);

		if(
			!(
				user_result_.status === "success" && 
				user_result_.user_result && 
				user_result_.user_result.records && 
				user_result_.user_result.records.length === 2
			)
		)
		{
			if( !user_result_.user_result.records[0] )
				result.message = `Could not get both Agent and Admin details`;
			else if (
				user_result_.user_result.records[0] && 
				user_result_.user_result.records[0]["Name"] === agent_id
			)
				result.message = `Could not get admin details`;
			else
				result.message = `Could not get agent details`;

			return result;
		}

		let agent_result_ = {};
		let admin_result_ = {};

		if(
			user_result_.user_result.records && 
			user_result_.user_result.records[0] && 
			user_result_.user_result.records[1] && 
			user_result_.user_result.records[0]["Name"] === agent_id
		)
		{
			agent_result_ = user_result_.user_result.records[0];
			admin_result_ = user_result_.user_result.records[1];
		}
		else
		{
			agent_result_ = user_result_.user_result.records[1];
			admin_result_ = user_result_.user_result.records[0];
		}

		// Validate agent and admin
		if(agent_result_.user_type__c !== "Agent")
		{
			result.message = `Agent user-type mismatch - expected ${agent_result_.user_type__c}`;
			return result;
		}

		// Validate agent and admin
		if(admin_result_.user_type__c !== "Admin")
		{
			result.message = `Admin user-type mismatch - expected ${admin_result_.user_type__c}`;
			return result;
		}

		const agent_SF_Id_ = agent_result_.Id;
		const admin_SF_Id_ = admin_result_.Id;

		// Update service record with `Agent SF Id
		const update_result_ = await patch_object_record(
			"service__c",
			service_SF_Id_,
			{
				"agent__c": agent_SF_Id_,
				// "start_service_date_time__c": start_service_date_time,
				"start_service_date_time__c": new Date(start_service_date_time),
				"admin_id__c": admin_SF_Id_,
				"service_status__c": "Active",
			}
		);

		if (update_result_.status !== "success" && !update_result_.result)
		{
			result.message = `Could not assign agent ID - ${agent_id} for the service - ${service_id}`;
			return result;
		}

		result.update_result = update_result_.result;
		result.status = "success";

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;

}

async function assign_agent_by_name(service_id, agent_name)
{
	const result = { status: "fail" };

	if (
		!(
			service_id &&
			agent_name
		)
	)
	{
		result.message = "Invalid Service ID or Agent Name. Please check and try again.";
		return result;
	}

	try
	{
		// Get Agent SF Id
		const agent_query = `
			SELECT Id 
			FROM user__c 
			WHERE user_name__c = '${agent_name}'
		`;

		const agent_result = await find_objects_by_query(agent_query, []);

		// Validate agent_result
		if (
			!(
				agent_result.success &&
				agent_result.find_result &&
				agent_result.find_result.records &&
				agent_result.find_result.records.length > 0
			)
		)
		{
			result.message = "Agent not found";

			return result;
		}

		const __agent_SF_Id = agent_result.find_result.records[0]['Id'];

		// Get Services SF Id
		const service_ID_result = await find_objects_by_query(
			`
				SELECT Id 
				FROM service__c 
				WHERE Name = '${service_id}'
			`,
			[]
		);

		// Validate Services SF Id
		if (
			!(
				service_ID_result.success &&
				service_ID_result.find_result &&
				service_ID_result.find_result.records &&
				service_ID_result.find_result.records.length > 0
			)
		)
		{
			result.message = "Service not found";

			return result;
		}

		const __service_SF_Id = service_ID_result.find_result.records[0]['Id'];

		// Update service record with Agent SF Id
		const update_result = await patch_object_record(
			"service__c",
			__service_SF_Id,
			{
				"agent__c": __agent_SF_Id
			}
		);

		result.update_result = update_result;

		if (update_result.status === "success") result.status = "success";

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;

}

async function find_services_for_user_id(user_id, customer)
{
	const result = { status: "fail" };

	try
	{
		const service_records_ = await get_services(
			`${(customer) ? "customer__r.Name" : "agent__r.Name"} = '${user_id}'`
		);

		if (service_records_ <= 0)
		{
			result.message = `Could not find services for ${(customer) ? "customer" : "Agent"} ID - ${user_id}`;
			return result;
		}

		service_records_.forEach((record_) =>
		{
			if (record_.customer__r !== null) delete record_.customer__r.attributes;
			if (record_.product__r !== null) delete record_.product__r.attributes;
			if (record_.agent__r !== null) delete record_.agent__r.attributes;
		});

		// return
		result.status = "success";
		result.service_customer_result = {
			length: service_records_.length,
			records: service_records_,
		};

	}
	catch (error)
	{
		console.log(error.message);
		result.error = error.message;
	}

	return result;

}

async function update_service_start_date_time(service_id, user_id, start_date_time)
{
	const result = { status: "fail" };

	try
	{
		const validate_customer_service_res_ = await find_objects_by_query(`
			SELECT Id 
			FROM service__c 
			WHERE Name = '${service_id}' 
				AND (
					agent__r.Name = '${user_id}' OR 
					customer__r.Name = '${user_id}' 
				)
			LIMIT 1
		`, []);

		if (
			!(
				validate_customer_service_res_.success &&
				validate_customer_service_res_.find_result &&
				validate_customer_service_res_.find_result.records &&
				validate_customer_service_res_.find_result.records.length > 0 &&
				validate_customer_service_res_.find_result.records[0].Id
			)
		)
		{
			result.message = `Could not find service for service ID - '${service_id}' and user - '${user_id}'`;
			return result;
		}

		const service_SF_Id = validate_customer_service_res_.find_result.records[0].Id;

		const service_update_result = await patch_object_record(
			"service__c",
			service_SF_Id,
			{
				service_status__c : "Pending",
				// start_service_date_time__c: (new Date(start_date_time)).toISOString(),
				start_service_date_time__c: new Date(start_date_time),
			}
		);

		result.service_update_result = service_update_result;

		if (!service_update_result.success)
		{
			result.message = "Could not update service start date-time."
			return result;
		}

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

module.exports = {
	initiate_service,
	track_services,
	find_services_for_brand_id,
	find_services_for_product_id,
	find_services_for_user_id,
	assign_agent_by_id,
	assign_agent_by_name,
	update_service_start_date_time
};
