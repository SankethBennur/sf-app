const express = require("express");
const router = express.Router();

const {
	find_products_by_brand_category_subcategory,
	find_product_by_name,
	find_products_by_product_IDs,
	create_new_product,
	get_categories_with_products,
} = require("../src/src.products");

const { validate_http_queries } = require("../lib/lib.middleware");

router.get(
	"/",
	async (request, response) =>
{
	let product_result = {};

	try
	{
		let product_id_list_ = [];
		let product_name_ = "";

		if(request.query.product_id_list)
			product_id_list_ = (request.query.product_id_list).replace(/\s/g, '').split(',');

		if(request.query.product_name)
			product_name_ = request.query.product_name;

		if (product_id_list_ && product_id_list_.length > 0)
		{
			product_result = await find_products_by_product_IDs(product_id_list_, ['product_name__c']);

			// Validate result of creation of products SF object data
			if(
				!(
					product_result.status === "success" && 
					product_result.product_result &&
					product_result.product_result.records && 
					product_result.product_result.records.length && 
					product_result.product_result.records.length > 0
				)
			)
			{
				response.
					status(500).
					json(
						{
							message: "Failed to get products! :(",
							result: product_result,
						}
					);

				return;
			}

			// Success - Send success response
			response.
				status(200).
				json(
					{
						message: "Successfully fetched products! :)",
						result: product_result,
					}
				);

			return;
		}

		if (product_name_)
		{
			product_result = await find_product_by_name(product_name_);

			// Validate result of creation of products SF object data
			if(product_result.status === "fail")
			{
				response.
					status(500).
					json(
						{
							message: "Failed to get products! :(",
							result: product_result,
						}
					);

				return;
			}

			// Success - Send success response
			response.
				status(200).
				json(
					{
						message: "Successfully fetched products! :)",
						result: product_result,
					}
				);

			return;
		}

		// else proceed to fetch products by brand, category, sub_category
		const brand_id_list_ = (request.query.brand_id_list)
			? (request.query.brand_id_list).replace(/\s/g, '').split(',')
			: [];
		const category_id_list_ = (request.query.category_id_list)
			? (request.query.category_id_list).replace(/\s/g, '').split(',')
			: [];
		const sub_category_id_list_ = (request.query.sub_category_id_list)
			? (request.query.sub_category_id_list).replace(/\s/g, '').split(',')
			: [];

		if(
			!(
				(brand_id_list_.length && brand_id_list_.length > 0) || 
				(category_id_list_.length && category_id_list_.length > 0) || 
				(sub_category_id_list_.length && sub_category_id_list_.length > 0)
			)
		)
		{
			response.
				status(500).
				json(
					{
						message: `Neither brand ID, category ID nor sub-category ID is valid.`,
					}
				);
			return;
		}

		// Get product
		const product_result_ = await find_products_by_brand_category_subcategory(
			brand_id_list_,
			category_id_list_,
			sub_category_id_list_,
		);

		if(product_result_.status === "fail")
		{
			response.
				status(500).
				json(
					{
						message: "Failed to get products.",
						result: product_result_,
					}
				);

			return;
		}

		// Success - Send success response
		response.
			status(200).
			json(
				{
					message: "Successfully fetched products.",
					result: product_result_,
				}
			);

		return;

	}

	catch (error)
	{
		console.log(error.message);
		response.
			status(500).
			json(
				{
					message: "An unexpected error ocurred.",
					error: error.message,
				}
			);
	}

});

router.post(
	"/create",
	validate_http_queries(["product_name"]),
	async (request, response) =>
	{
		const product_name_ = request.query.product_name;

		try
		{
			const add_product_result_ = await create_new_product(product_name_);

			if(add_product_result_.status === "fail")
			{
				response.
					status(500).
					json(
						{
							message: `Could not add product - ${product_name_}`,
							create_result: add_product_result_,
						}
					);
				return;
			}

			response.
				status(200).
				json(
					{
						message: `Successfully added product - ${product_name_}`,
						create_result: add_product_result_,
					}
				);

		}
		catch (error)
		{
			response.
				status(500).
				json(
					{
						message: `An unexpected error ocurred`,
						error: error.message,
					}
				);
		}

	}
);

router.get(
	"/categories",
	async (request, response) =>
	{
		const category_id_list_ = (request.query.category_id_list)
			? (request.query.category_id_list).replace(/\s/g, '').split(',')
			: [];

		try
		{
			const categories_res_ = await get_categories_with_products(category_id_list_);

			if(categories_res_.status === "fail")
			{
				response.
					status(500).
					json(
						{
							message: `Could not get category response.`,
							category_response: categories_res_,
						}
					);
				return;
			}

			response.
				status(200).
				json(
					{
						message: `Successfully got category response.`,
						category_response: categories_res_,
					}
				);

		}
		catch(error)
		{
			response.
				status(500).
				json(
					{
						message: `An unexpected error ocurred`,
						error: error.message,
					}
				);
		}

	}
);

module.exports = router;
