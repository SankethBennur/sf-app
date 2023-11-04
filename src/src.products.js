const {
	find_objects_by_query,
	create_object_record
} = require("../lib/lib.SFobjects");

const { get_field_values_list } = require("../lib/lib.generator");

const product_field_arr = [
	'Name', 
	"product_name__c",
	"product_image_url__c",
	"product_description__c",
];

async function find_products_by_product_IDs(product_id_list, field_name_list)
{
	const result = { status : "fail" };

	if(
		product_id_list.length <= 0 ||
		field_name_list.length <= 0
	)
	{
		let __err_msg = "Empty product_id or fields list";

		__err_msg = (product_id_list.length <= 0) ? "Empty product ID list" : __err_msg;
		
		__err_msg = (field_name_list.length <= 0) ? "Empty field names list" : __err_msg;
		
		__err_msg = (product_id_list.length <= 0 && field_name_list.length <= 0) ? 
			"Empty product_id and fields list" : 
			__err_msg;

		result.error = __err_msg;
		return result;
	}

	try
	{
		const query = `
			SELECT ${product_field_arr.concat(field_name_list).join(', ')} 
			FROM product__c 
			WHERE Name IN ('${product_id_list.join("', '")}')
		`;

		const query_result = await find_objects_by_query(query, []);

		if(
			!(
				query_result.success &&
				query_result.find_result &&
				query_result.find_result.records &&
				query_result.find_result.records.length &&
				query_result.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not get any products of IDs - ${product_id_list}`;
			return result;
		}
		
		result.status = "success";
		result.product_result = query_result.find_result;

	}
	catch(error)
	{
		result.error = error.message;
	}
	
	return result;

}

async function find_product_by_name(product_name)
{
	const result = { status: "fail" };

	if(!product_name)
	{
		result.message = "Invalid product name";
		return result;
	}

	try
	{
		const query = `
			SELECT ${product_field_arr.join(', ')} 
			FROM product__c 
			WHERE product_name__c = '${product_name}'
			LIMIT 1
		`;

		const query_result_ = await find_objects_by_query(query);

		if(
			!(
				query_result_.success && 
				query_result_.find_result &&
				query_result_.find_result.records &&
				query_result_.find_result.records.length && 
				query_result_.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not find any product of product name - ${product_name}`;
			return result;
		}

		result.status = `success`;
		result.product_result = query_result_.find_result;

	}
	catch(error)
	{
		result.error = error.message;
	}

	return result;

}

async function find_products_by_brand_category_subcategory(brand_id_list, category_id_list, sub_category_id_list)
{
	const result = { status: "fail" };

	try
	{
		const condition_array_ = [];

		if(brand_id_list.length && brand_id_list.length > 0)
			condition_array_.push(`brand__r.Name IN ('${brand_id_list.join("', '")}')`);

		if(category_id_list.length && category_id_list.length > 0)
			condition_array_.push(`category__r.Name IN ('${category_id_list.join("', '")}')`);

		if(sub_category_id_list.length && sub_category_id_list.length > 0)
			condition_array_.push(`sub_category__r.Name IN ('${sub_category_id_list.join("', '")}')`);

		if( !(condition_array_.length && condition_array_.length > 0) )
		{
			result.message = `Neither brand ID, category ID nor sub-category ID provided.`;
			return result;
		}

		const condition_query_ = condition_array_.join("\n AND ");

		const query_ = `
			SELECT product__r.product_name__c, product__r.product_image_url__c, product__r.product_description__c, brand__r.brand_name__c, category__r.category_name__c, sub_category__r.sub_category_name__c 
			FROM product_brand_category_map__c 
			WHERE ${condition_query_}
		`;

		const product_res_ = await find_objects_by_query(query_, []);

		if(
			!(
				product_res_.success && 
				product_res_.find_result && 
				product_res_.find_result.records && 
				product_res_.find_result.records.length && 
				product_res_.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not get any products with the following condition - ${condition_query_}`;
			return result;
		}

		result.status = "success";
		result.product_result = product_res_.find_result;

	}
	catch(error)
	{
		result.error = error.message;
	}

	return result;

}

const create_new_product = async (product_name_) =>
{
	const result = { status: "fail" };

	if (!product_name_)
	{
		result.message = `No product name specified`;
		return result;
	}

	try
	{
		const create_product_res_ = await create_object_record(
			`product__c`,
			{
				product_name__c: product_name_
			}
		);

		if(!create_product_res_.success)
		{
			result.message = `Could not create product - ${product_name_}`;
			return result;
		}

		result.status = "success";
		result.create_result = create_product_res_;

	}
	catch (error)
	{
		result.error = error.message;
		return result;
	}

	return result
}

const get_category_list_index = (cat_list, cat_id) =>
{
	for (let i=0 ; i < cat_list.length ; i++)
		if (cat_list[i].id && cat_list[i].id === cat_id)
			return i;

	return -1;
}

const filter_category_with_products = (category_response_list) => 
{
	if(
		!(
			category_response_list && 
			category_response_list.length && 
			category_response_list.length > 0
		)
	)	return [];

	let cat_res_list_ = [];

	let index_ = -1;

	for (let i=0 ; i < category_response_list.length ; i++)
	{
		index_ = get_category_list_index(cat_res_list_, category_response_list[i].category__r.Name);

		if (index_ < 0)
			cat_res_list_.push(
				{
					id: category_response_list[i].category__r.Name,
					name: category_response_list[i].category__r.category_name__c,
					products: [
						{
							id: category_response_list[i].product__r.Name,
							name: category_response_list[i].product__r.product_name__c,
							image_url: category_response_list[i].product__r.product_image_url__c,
							description: category_response_list[i].product__r.product_description__c,
						}
					],
				}
			);
		else
			cat_res_list_[index_].products.push(
				{
					id: category_response_list[i].product__r.Name,
					name: category_response_list[i].product__r.product_name__c,
					image_url: category_response_list[i].product__r.product_image_url__c,
					description: category_response_list[i].product__r.product_description__c,
				}
			);
	}

	return cat_res_list_;

}

const get_categories_with_products = async (category_id_list) =>
{
	const result = { status: "fail" };

	try
	{
		const condition_ = (
				category_id_list.length && 
				category_id_list.length > 0
			)
			? `WHERE category__r.Name in ('${category_id_list.join("', '")}')`
			: ``;

		const query_ = `
			SELECT category__r.Name, category__r.category_name__c, product__r.Name, product__r.product_name__c, product__r.product_image_url__c, product__r.product_description__c 
			FROM product_brand_category_map__c 
			${condition_}`
		;

		const category_res_ = await find_objects_by_query(query_, []);

		if(
			!(
				category_res_.success && 
				category_res_.find_result && 
				category_res_.find_result.records && 
				category_res_.find_result.records.length && 
				category_res_.find_result.records.length > 0
			)
		)
		{
			result.message = `Could not find any category from the category ID list: ${category_id_list}`;
			return result;
		}

		result.category_list = filter_category_with_products(category_res_.find_result.records);
		result.status = "success";
	}
	catch(error)
	{
		result.error = error.message;
	}

	return result;
}

module.exports = {
	find_products_by_product_IDs,
	find_product_by_name,
	find_products_by_brand_category_subcategory,
	create_new_product,
	get_categories_with_products,
};
