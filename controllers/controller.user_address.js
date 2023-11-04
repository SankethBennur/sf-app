const express = require("express");
const router = express.Router();

const { validate_http_queries, validate_user_id_registered } = require("../lib/lib.middleware");

const { get_user_addresses } = require("../src/src.user_address");

router.get(
	"/",
	validate_http_queries(["user_id"]),
	validate_user_id_registered(),
	async (request, response) =>
	{
		const user_id_ = request.query.user_id;
		const address_title_ = (request.query.address_title)
			? request.query.address_title.toLowerCase()
			: "";

		const user_address_res_ = await get_user_addresses(user_id_, address_title_);

		if(user_address_res_.status === "fail")
		{
			response.
				status(500).
				json(
					{
						message: "Could not get user addresses at this time.",
						user_address_response: user_address_res_,
					}
				);
			return;
		}

		response.
			status(200).
			json(
				{
					message: "Successfully got user addresses.",
					user_address_response: user_address_res_,
				}
			);
	}
);

module.exports = router;
