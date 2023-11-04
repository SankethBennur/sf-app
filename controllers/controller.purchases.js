const express = require("express");
const router = express.Router();

require("dotenv").config();

const { multer_upload, create_multer_object } = require("../utils/utils.file_upload");

const {
	get_brands_bought_by_user_id,
	create_purchase_record,
	get_purchases_from_user_id_list,
	create_new_purchase_record,
	new_purchase_upload_record,
} = require("../src/src.purchases");

const { validate_http_queries } = require("../lib/lib.middleware");

router.get(
	"/",
	validate_http_queries(["user_id_list"]),
	async (request, response) =>
	{
		const user_id_list_ = (request.query.user_id_list).replace(/\s/g, '').split(',');

		if (
			!(
				user_id_list_ &&
				user_id_list_.length &&
				user_id_list_.length > 0
			)
		)
		{
			response.
				status(501).
				json(
					{
						message: "Invalid user ID",
					}
				);
		}

		try
		{
			const purchase_result = await get_purchases_from_user_id_list(user_id_list_);

			if (purchase_result.status === "fail")
			{
				response.
					status(502).
					json(
						{
							message: `Unable to find purchases for user ID list - ${user_id_list_}`,
							purchase_result: purchase_result,
						}
					);

				return;
			}

			response.
				status(200).
				json(
					{
						message: `Successfully found products for user ID list - ${user_id_list_}`,
						purchase_result: purchase_result,
					}
				);

		}
		catch (error)
		{
			response.
				status(500).
				json(
					{
						message: "An unexpected error occured",
						error: error.message,
					}
				);
		}

	}
);

router.get("/brands", async (request, response) =>
{
	const user_id = request.query.user_id;

	if (!user_id)
	{
		response.
			status(501).
			json(
				{
					message: "Invalid user ID",
				}
			);
	}

	try
	{
		const purchase_result = await get_brands_bought_by_user_id(user_id);

		if (purchase_result.status === "fail")
		{
			response.
				status(502).
				json(
					{
						message: `Unable to find brands purchased by user ID - ${user_id}`,
						purchase_result: purchase_result,
					}
				);

			return;
		}

		response.
			status(200).
			json(
				{
					message: `Successfully found brands purchased by user - ${user_id}`,
					purchase_result: purchase_result,
				}
			);

	}
	catch (error)
	{
		response.
			status(500).
			json(
				{
					message: "An unexpected error occured",
					error: error.message,
				}
			);
	}

});

router.post(
	"/new",
	validate_http_queries(["user_id", "product_id"]),
	multer_upload.single("invoice"),
	async (request, response) =>
	{
		const customer_id_ = request.query.user_id;
		const product_id_ = request.query.product_id;

		try
		{
			if (!request.file)
			{
				response.
					status(500).
					json(
						{
							message: "Could not save uploaded file.",
						}
					);

				return;
			}

			const create_new_purchase_record_ = await create_purchase_record(customer_id_, product_id_, request.file);

			if (create_new_purchase_record_.status === "fail")
			{
				response.
					status(500).
					json(
						{
							message: `Could not create purchase record for customer ID - ${customer_id_} and product ID - ${product_id_}.`,
							create_result: create_new_purchase_record_,
						}
					);
				return;
			}

			response.
				status(200).
				json(
					{
						message: `Successfully created purchase record for customer ID - ${customer_id_} and product ID - ${product_id_}.`,
						create_result: create_new_purchase_record_,
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

router.post(
	"/new/v2",
	validate_http_queries(["user_id", "product_id"]),
	async (request, response) => 
	{
		const user_id_ = request.query.user_id;
		const product_id_ = request.query.product_id;
		const purchase_date_time_ = (request.query.purchase_date_time)
			? (new Date(request.query.purchase_date_time)).toISOString()
			: "";

		try
		{
			const purchase_res_ = await create_new_purchase_record(
				user_id_,
				product_id_,
				purchase_date_time_
			);

			if (
				!(
					purchase_res_.status === "success" &&
					purchase_res_.purchase_result &&
					purchase_res_.purchase_result.id
				)
			)
			{
				response.
					status(500).
					json({
						message: `Could not store purchase result`,
						purchase_result: purchase_res_,
					});
				return;
			}

			response.
				status(200).
				json({
					message: "Successfully created product record",
				});

			/*

			const purchase_rec_SF_Id = purchase_res_.purchase_result.id;

			// Upload invoice first, then product images

			const upload_field_handler_ = multer_upload.fields([
				{ name: "invoice", maxCount: 1 },
				{
					name: "product-image",
					maxCount: parseInt(process.env.PRODUCT_IMAGE_MAX_FILE_UPLOAD, 10)
				}
			]);

			upload_field_handler_(request, response, async (error) =>
			{
				if (
					error ||
					!(
						request.files["invoice"] ||
						request.files["product-image"]
					)
				)
				{
					response.
						status(500).
						json({
							message: `Could not upload any file`,
							error: (error && error.message)
								? error.message
								// : "Missing a file",
								: "Missing product images",
						});
					return;
				}

				// handle purchase_upload record for invoice
				const invoice_upload_res_ = await new_purchase_upload_record(
					purchase_rec_SF_Id,
					"Invoice",
					(request.files["invoice"][0]).filename
				);

				if (invoice_upload_res_.status === "fail")
				{
					response.
						status(500).
						json({
							error: `Could not create upload record for invoice`,
							purchase_record: `Successfully created purchase record`,
							invoice_file: `Successfully saved invoice upload file`,
						});
					// async function to delete such file
					return;
				}

				const failed_product_file_record_arr_ = [];

				// handle purchase_upload record for product images
				request.files["product-image"].forEach(async (file) =>
				{
					if (!(file && file.filename)) return;	// return continues the loop

					const product_image_upload_res_ = await new_purchase_upload_record(
						purchase_rec_SF_Id,
						"Product Image",
						file.filename
					);

					if (product_image_upload_res_.status === "fail")
						failed_product_file_record_arr_.push(file.filename);
				});

				if (failed_product_file_record_arr_.length > 0)
				{
					response.
						status(500).
						json({
							error: `Could not create upload record for following products - ${failed_product_file_record_arr_}`,
							purchase_record: `Successfully created purchase record`,
							invoice_file: `Successfully saved invoice upload file`,
							invoice_record: `Successfully created invoice upload record`,
							product_image_files: `Successfully saved all product image upload files`,
						});
					// async function to delete the file
					return;
				}

				// Finally, the success
				response.
					status(200).
					json({
						success: true,
						message: `Successfully saved purchase records with invoice and product images`,
						purchase_record: `Successfully created purchase record`,
						invoice_file: `Successfully saved invoice upload file`,
						invoice_record: `Successfully created invoice upload record`,
						product_image_files: `Successfully saved all product image upload files`,
						product_images_record: `Successfully created product image upload records`,
					});

			});

			// Don't handle any response here
			*/

		}
		catch (error)
		{
			response.
				status(500).
				json({
					message: `An unexpected error ocurred.`,
					error: error.message,
				});
		}
	}
);

module.exports = router;
