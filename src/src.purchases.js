const { find_objects_by_query, create_object_record } = require("../lib/lib.SFobjects");

const { get_field_values_list } = require("../lib/lib.generator");

const { find_users_by_user_IDs } = require("../src/src.users");

const { find_products_by_product_IDs } = require("./src.products");

const purchase_field_arr = [
	`Name`,
	`user__r.Name`,
	`user__r.user_name__c`,
	`product__r.Name`,
	`product__r.product_name__c`,
	`product__r.product_image_url__c`,
	`product__r.product_description__c`,
	// `purchase_date_time__c`,
	// `invoice_file_name__c`
];

async function get_purchases_from_user_id_list(user_id_list, include_SF_Id = false)
{
	const result = { status: "fail" };

	if(user_id_list.length && user_id_list.length <= 0)
	{
		result.message = `User list is invalid - ${user_id_list}`;
		return result;
	}

	try
	{
		const query_ = `
			SELECT ${ 
				(include_SF_Id)
				? purchase_field_arr.push("Id").join(', ')
				: purchase_field_arr.join(', ')
			}
			FROM purchase__c 
			WHERE user__r.Name IN ('${user_id_list.join("', '")}')
		`;

		const purchase_res_ = await find_objects_by_query(query_, []);

		if(
			!(
				purchase_res_.success && 
				purchase_res_.find_result.records && 
				purchase_res_.find_result.records.length && 
				purchase_res_.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not find any purchases for the users - ${user_id_list}`;
			return result;
		}

		result.status = "success";
		result.purchase_result = purchase_res_.find_result;

	}
	catch(error)
	{
		result.error = error.message;
	}

	return result;

}

async function get_brands_bought_by_user_id(user_id)
{
	const result = { status: "fail" };

	try
	{
		// Get user SF Ids result
		const user_result = await find_users_by_user_IDs([user_id], ['Id']);
		
		if(
			!(
				user_result.status === "success" && 
				user_result.find_result && 
				user_result.find_result.records && 
				user_result.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not find user SF Id for user - ${user_id}`;
			return result;
		}

		const user_SF_Id = user_result.find_result.records[0]['Id'];

		// Query for product SF Id in purchase records
		const product_query = `
			SELECT product__c 
			FROM purchase__c 
			WHERE user__c = '${user_SF_Id}'
		`;

		const product_result = await find_objects_by_query(product_query, []);

		if(
			!(
				product_result.success && 
				product_result.find_result &&
				product_result.find_result.records &&
				product_result.find_result.records.length && 
				product_result.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not find products.`;
			return result;
		}

		result.product_result = product_result.find_result;

		const __prod_SF_Id_list = get_field_values_list(product_result.records, ["product__c"]);

		// Query for brand SF Id with product SF Id
		const brand_query = `
			SELECT brand__c 
			FROM product_brand_category_map__c  
			WHERE product__c IN ('${__prod_SF_Id_list.join("', '")}')
		`;

		const brand_result = await find_objects_by_query(brand_query, []);

		if(
			!(
				brand_result.find_result.records || 
				brand_result.find_result.records.length > 0
			)
		)
		{
			result.message = "Unable to find brands for products.";
			return result;
		}

		const __brand_pur_SF_Id_list = get_field_values_list(brand_result.records, ["brand__c"]);

		// Query for brand details using brand SF Id
		const brand_purchase_query = `
			SELECT brand_name__c  
			FROM brand__c 
			WHERE Id IN ('${__brand_pur_SF_Id_list.join("' ,'")}')
		`;

		const brand_purchase_result = await find_objects_by_query(brand_purchase_query, []);
		result.brand_purchase_result = brand_purchase_result.find_result;

		if(
			brand_purchase_result.find_result.records || 
			brand_purchase_result.find_result.records.length > 0
		)
			result.status = "success";

	}
	catch(error)
	{
		result.error = error.message;
	}

	return result;

}

const create_purchase_record = async (customer_id, product_id, invoice_file_details) =>
{
	const result = { status: "fail" };

	if( !( customer_id && product_id ) )
	{
		result.message = `Invalid customer ID - ${customer_id} and/or product ID - ${product_id}`
		return result;
	}

	if( !(invoice_file_details && invoice_file_details.path) )
	{
		result.message = `Invalid invoice file details.`;
		return result;
	}

	let customer_SF_Id_ = "";
	let product_SF_Id_ = "";

	try
	{
		// get customer SF Id
		const customer_SF_res_ = await find_users_by_user_IDs([customer_id], ["Id"]);

		if(
			!(
				customer_SF_res_.status === "success" && 
				customer_SF_res_.find_result && 
				customer_SF_res_.find_result.records && 
				customer_SF_res_.find_result.records[0] && 
				customer_SF_res_.find_result.records[0]["Id"]
			)
		)
		{
			result.message = `Could not find customer of ID - ${customer_id}`;
			return result;
		}

		customer_SF_Id_ = customer_SF_res_.find_result.records[0]["Id"];
		
		// get product SF Id
		const product_SF_res_ = await find_products_by_product_IDs([product_id], ["Id"]);

		if(
			!(
				product_SF_res_.status === "success" && 
				product_SF_res_.product_result && 
				product_SF_res_.product_result.records && 
				product_SF_res_.product_result.records[0] && 
				product_SF_res_.product_result.records[0]["Id"]
			)
		)
		{
			result.message = `Could not find customer of ID - ${customer_id}`;
			return result;
		}

		product_SF_Id_ = product_SF_res_.product_result.records[0]["Id"];

		// store invoice details
		const invoice_upload_res_ = await create_object_record(
			"user_uploads__c",
			{
				file_URL__c: invoice_file_details.path,
				upload_file_type__c: "invoice",
				user__c: customer_SF_Id_
			},
			true
		);

		if( !(invoice_upload_res_.success && invoice_upload_res_.create_result.id) )
		{
			result.message = `Could not store invoice details.`;
			return result;
		}

		const invoice_SF_Id_ = invoice_upload_res_.create_result.id;

		// Create purchase record
		const create_purchase_res_ = await create_object_record(
			"purchase__c",
			{
				"user__c": customer_SF_Id_,
				"product__c": product_SF_Id_,
				// "purchase_date_time__c": (new Date()).toISOString(),
				"purchase_date_time__c": new Date(),
				"invoice_upload__c": invoice_SF_Id_,
			}
		);

		if(!create_purchase_res_.success)
		{
			result.message = `Could not create purchase for customer ID - ${customer_id} and product ID - ${product_id}`;
			return result;
		}

		result.status = "success";
		result.create_purchase_result = create_purchase_res_;

	}
	catch(error)
	{
		result.error = error.message;
	}

	return result;
}

const create_new_purchase_record = async (customer_id, product_id, purchase_date_time) =>
{
	const result = { status: "fail" };

	if( !( customer_id && product_id ) )
	{
		result.message = `Invalid customer ID - ${customer_id} and/or product ID - ${product_id}`
		return result;
	}

	let customer_SF_Id_ = "";
	let product_SF_Id_ = "";

	try
	{
		const field_arr_ = [ "Name", "user__r.Name", "user__r.full_name__c", "product__r.Name", "product__r.product_name__c" ];

		// first check for existing user and product in a purchase
		const existing_rec_ = await find_objects_by_query(`
			SELECT ${field_arr_.join(", ")} 
			FROM purchase__c 
			WHERE user__r.Name = '${customer_id}' AND product__r.Name = '${product_id}' 
		`, []);

		if((
			existing_rec_.success && 
			existing_rec_.find_result && 
			existing_rec_.find_result.records && 
			existing_rec_.find_result.records.length && 
			existing_rec_.find_result.records.length > 0 
		))
		{
			result.message = `Purchase record already exists`;
			result.records = existing_rec_.find_result.records;
			return result;
		}

		// get customer SF Id
		const customer_SF_res_ = await find_users_by_user_IDs([customer_id], ["Id"]);

		if(
			!(
				customer_SF_res_.status === "success" && 
				customer_SF_res_.find_result && 
				customer_SF_res_.find_result.records && 
				customer_SF_res_.find_result.records[0] && 
				customer_SF_res_.find_result.records[0]["Id"]
			)
		)
		{
			result.message = `Could not find customer of ID - ${customer_id}`;
			return result;
		}

		customer_SF_Id_ = customer_SF_res_.find_result.records[0]["Id"];
		
		// get product SF Id
		const product_SF_res_ = await find_products_by_product_IDs([product_id], ["Id"]);

		if(
			!(
				product_SF_res_.status === "success" && 
				product_SF_res_.product_result && 
				product_SF_res_.product_result.records && 
				product_SF_res_.product_result.records[0] && 
				product_SF_res_.product_result.records[0]["Id"]
			)
		)
		{
			result.message = `Could not find customer of ID - ${customer_id}`;
			return result;
		}

		product_SF_Id_ = product_SF_res_.product_result.records[0]["Id"];

		const new_purchase_ = {
			"user__c": customer_SF_Id_,
			"product__c": product_SF_Id_,
			"purchase_date_time__c": (purchase_date_time)
				// ? (new Date(purchase_date_time)).toISOString()
				? new Date(purchase_date_time)
				: "",
		};

		const purchase_res_ = await create_object_record("purchase__c", new_purchase_, true);

		if( !(purchase_res_.success && purchase_res_.create_result.id) )
		{
			result.message = `Could not create new purchase record for user - ${user_id} and product - ${product_id} at this time`;
			return result;
		}

		result.purchase_result = purchase_res_.create_result;
		result.status = "success";

	}
	catch(error)
	{
		result.error = error.message;
	}

	return result;
}

const new_purchase_upload_record = async (purchase_SF_Id, file_type, file_URL) =>
{
	const result = { status : "fail" };

	if(!purchase_SF_Id)
	{
		result.message = `Invalid purchase SF Id`;
		return result;
	}

	try
	{
		const purchase_upload_res_ = await create_object_record(
			`purchase_upload__c`,
			{
				purchase__c: purchase_SF_Id,
				file_type__c: file_type,
				file_URL__c: file_URL
			}
		);

		if(!purchase_upload_res_.success)
		{
			result.message = `Could not create upload record for file type - ${file_type}`;
			return result;
		}

		result.purchase_upload_result = purchase_upload_res_;
		result.status = "success";

	}
	catch(error)
	{
		result.error = error.message;
	}

	return result;
}

module.exports = {
	get_purchases_from_user_id_list,
	get_brands_bought_by_user_id,
	create_purchase_record,
	create_new_purchase_record,
	new_purchase_upload_record,
};
