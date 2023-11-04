const express = require("express");
const router = express.Router();

const {
    initiate_service,
    track_services,
    find_services_for_brand_id,
    find_services_for_product_id,
    find_services_for_user_id,
    assign_agent_by_name,
    assign_agent_by_id,
    update_service_start_date_time,
} = require("../src/src.services");

const { add_service_comment } = require("../src/src.service_status");

const {
    validate_http_queries, validate_http_body_arguments
} = require("../lib/lib.middleware");

const {
    SF_outbound_message_xml_unwrap, build_SOAP_response
} = require("../utils/utils.xml_unwrap");
const { create_new_notification, make_notification_on_service_assignment } = require("../src/src.notifications");

router.get(
    "/",
    async (request, response) =>
    {
        const brand_id = request.query.brand_id;
        const product_id = request.query.product_id;
        const user_id = request.query.user_id;

        const customer = (
            request.query.customer &&
            request.query.customer.toLowerCase() === "true"
        )
            ? true
            : false;

        let service_result = {};

        try
        {
            if (brand_id)
            {
                service_result = await find_services_for_brand_id(brand_id);

                // Validate result
                if (
                    !service_result.status ||
                    service_result.status === "fail"
                )
                {
                    response.
                        status(402).
                        json(
                            {
                                message: "Failed to get services! :(",
                                result: service_result,
                            }
                        );

                    return;
                }

                // Success - Send success response
                response.
                    status(200).
                    json(
                        {
                            message: "Successfully fetched services! :)",
                            result: service_result,
                        }
                    );

                return;
            }

            if (product_id)
            {
                service_result = await find_services_for_product_id(product_id);

                // Validate result
                if (
                    !service_result.status ||
                    service_result.status === "fail"
                )
                {
                    response.
                        status(402).
                        json(
                            {
                                message: "Failed to get services! :(",
                                result: service_result,
                            }
                        );

                    return;
                }

                // Success - Send success response
                response.
                    status(200).
                    json(
                        {
                            message: "Successfully fetched services! :)",
                            result: service_result,
                        }
                    );

                return;
            }

            if (user_id)
            {
                service_result = await find_services_for_user_id(user_id, customer);

                // Validate result
                if (
                    !service_result.status ||
                    service_result.status === "fail"
                )
                {
                    response.
                        status(402).
                        json(
                            {
                                message: "Failed to get services! :(",
                                result: service_result,
                            }
                        );

                    return;
                }

                // Success - Send success response
                response.
                    status(200).
                    json(
                        {
                            message: "Successfully fetched services! :)",
                            result: service_result,
                        }
                    );

                return;
            }

            // If neither, then error repsonse
            response.
                status(400).
                json(
                    {
                        message: "Neither brand nor product IDs are valid. Please check and try again.",
                    }
                );

            return;

        }
        catch (error)
        {
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
    "/request",
    validate_http_body_arguments(
        [
            "customer_id",
            "product_id",
            "type_of_service",
            "requirement_details",
        ]
    ),
    async (request, response) =>
    {
        const customer_id_ = request.body.customer_id;
        const product_id_ = request.body.product_id;
        const type_of_service_ = request.body.type_of_service;
        const requirement_details_ = request.body.requirement_details;
        const preferred_start_date_time_ = (request.body.preferred_start_date_time)
            ? request.body.preferred_start_date_time
            : "";

        try
        {
            const initiate_service_result_ = await initiate_service(
                customer_id_,
                product_id_,
                type_of_service_,
                requirement_details_,
                preferred_start_date_time_
            );

            if (
                !(
                    initiate_service_result_.status === "success" &&
                    initiate_service_result_.create_result &&
                    initiate_service_result_.create_result.success
                )
            )
            {
                response.
                    status(400).
                    json(
                        {
                            message: `Could not create service.`,
                            result: initiate_service_result_,
                        }
                    );

                return;
            }

            response.
                status(200).
                json(
                    {
                        message: `Successfully created service.`,
                        result: initiate_service_result_,
                    }
                );

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

    }
);

router.get(
    "/track",
    validate_http_queries(["service_id_list"]),
    async (request, response) =>
    {
        const service_id_string_ = request.query.service_id_list;
        const service_id_list_ = service_id_string_.replace(/\s/g, '').split(',');

        if (service_id_list_.length <= 0)
        {
            response.
                status(500).
                json(
                    {
                        error: "List provided is invalid",
                        list: request.query.service_id_list,
                    }
                )
            return;
        }

        try
        {
            const service_result = await track_services(service_id_list_);

            if (
                !(
                    service_result.status === "success" &&
                    service_result.length > 0
                )
            )
            {
                response.
                    status(402).
                    json(
                        {
                            message: "Could not find the service at this time.",
                            result: service_result,
                        }
                    );
                return;
            }

            response.
                status(200).
                json(
                    {
                        message: "Successfully fetched services.",
                        result: service_result,
                    }
                );

        }
        catch (error)
        {
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
    "/admin-assign-outbound-message",
    async (request, response) =>
    {
        try
        {
            const xml_unwrap_ = SF_outbound_message_xml_unwrap(request.body);

            if(!(
                xml_unwrap_.length &&
                xml_unwrap_.length > 0 && 
                xml_unwrap_[0].sobject[0] && 
                xml_unwrap_[0].sobject[0]["sf:id"] && 
                xml_unwrap_[0].sobject[0]["sf:name"]
            ))
            {
                response.
                    status(500).
                    json({
                        message: `Could not read outbound message from salesforce`,
                        xml_body: request.body,
                    });
                return;
            }

            const sf_object_ = xml_unwrap_[0].sobject[0];

            const service_id_ = sf_object_["sf:name"][0];
            const agent_id_ = sf_object_["sf:agent__c"][0];
            const customer_id_ = sf_object_["sf:customer__c"][0];
            const service_start_date_time_ = sf_object_["sf:start_service_date_time__c"][0];
            const service_status_ = sf_object_["sf:service_status__c"][0];

            // validate appropriate data
            if(!(
                service_id_ && 
                agent_id_ && 
                customer_id_ && 
                service_start_date_time_ && 
                service_status_
            ))
            {
                const missing_arguments_ = [];

                if (!service_id_) missing_arguments_.push("service_id");
                if (!agent_id_) missing_arguments_.push("agent_id");
                if (!customer_id_) missing_arguments_.push("customer_id");
                if (!service_start_date_time_) missing_arguments_.push("service_start_date_time");
                if (!service_status_) missing_arguments_.push("service_status");

                response.
                    status(500).
                    json({
                        message: `Did not receive appropriate arguments from outbound message`,
                        missing_arguments: missing_arguments_,
                    });

                return;
            }

            const agent_notification_ = make_notification_on_service_assignment(
                "agent",
                service_id_,
                service_start_date_time_,
                service_status_
            );

            const customer_notification_ = make_notification_on_service_assignment(
                "customer",
                service_id_,
                service_start_date_time_,
                service_status_
            );

            if(!(
                agent_notification_ && 
                customer_notification_ && 
                agent_notification_.subject && 
                agent_notification_.message && 
                customer_notification_.subject && 
                customer_notification_.message 
            ))
            {
                response.
                    status(500).
                    json({
                        message: `Failed to create notification for customer and agent`,
                        fix: `Please try again later or contact support.`,
                    });
                return;
            }

            // create new notification for agent
            create_new_notification(
                agent_id_,
                agent_notification_.subject,
                agent_notification_.message,
                true
            );

            // create new notification for agent
            create_new_notification(
                customer_id_,
                customer_notification_.subject,
                customer_notification_.message,
                true
            );

            // end of handler
            // response.
            //     status(200).
            //     json({
            //         message: `Successfully received outbound message from Salesforce`,
            //         notifications: `Created notifications for customer and agent`,
            //     });

            const xml_response_ = build_SOAP_response();

            response.
                status(200).
                set('Content-Type', 'application/xml').
                send(xml_response_);

        }
        catch (error)
        {
            console.log(error.message);
            response.
                status(500).
                json({
                    message: `An unexpected error ocurred.`,
                    error: error.message,
                });
        }
    }
);

// ===========================
// DEPRECATED

router.patch(
    "/assign",
    validate_http_body_arguments(
        ["service_id", "agent_id", "start_service_date_time", "admin_id"]
    ),
    async (request, response) =>
    {
        const service_id = request.body.service_id;
        
        const agent_id = request.body.agent_id;
        const agent_name = request.body.agent_name;

        const start_service_date_time = request.body.start_service_date_time;
        const admin_id = request.body.admin_id;

        try
        {
            let service_result = {};

            if (agent_id)
            {
                // Assign agent by ID
                service_result = await assign_agent_by_id(
                    service_id,
                    agent_id,
                    start_service_date_time,
                    admin_id
                );

                // Validate result
                if (service_result.status === "fail")
                {
                    response.
                        status(500).
                        json(
                            {
                                message: "An unexpected error ocurred.",
                                service_result: service_result,
                            }
                        );

                    return;
                }

                // Send success
                response.
                    status(200).
                    json(
                        {
                            message:
                                `Successfully assigned Agent - ${agent_id} to service - ${service_id} for date - ${start_service_date_time}`,
                            service_result: service_result,
                        }
                    );

                return;
            }

            if (agent_name)
            {
                // Assign agent by ID
                service_result = await assign_agent_by_name(service_id, agent_name);

                // Validate result
                if (service_result.status === "fail")
                {
                    response.
                        status(500).
                        json(
                            {
                                message: "An unexpected error ocurred.",
                                service_result: service_result,
                            }
                        );

                    return;
                }

                // Send success
                response.
                    status(200).
                    json(
                        {
                            message:
                                `Successfully assigned Agent - ${agent_name} to service - ${service_id}`,
                            service_result: service_result,
                        }
                    );

                return;
            }

            // else, respond fail message
            response.
                status(500).
                json(
                    {
                        message: "Unable to assign agent at this time.",
                    }
                );

        }
        catch (error)
        {
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

router.patch(
    "/service_start_date_time",
    // validate_http_queries(["service_id", "user_id", "service_start_date_time"]),
    validate_http_body_arguments(["service_id", "user_id", "service_start_date_time", "comment"]),
    async (request, response) =>
    {
        try
        {
            const service_id_ = request.body.service_id;
            const user_id_ = request.body.user_id;
            const service_start_date_time_ = request.body.service_start_date_time;
            const comment_ = request.body.comment;

            const service_start_date_time_result_ = await update_service_start_date_time(service_id_, user_id_, service_start_date_time_);

            if (service_start_date_time_result_.status === "fail")
            {
                response.
                    status(400).
                    json(
                        {
                            message: `Could not update service start date timer for user ID - '${user_id_}' and service_id - '${service_id_}'`,
                            result: service_start_date_time_result_,
                        }
                    );
                return;
            }

            if(comment_)
                add_service_comment(
                    service_id_,
                    user_id_,
                    comment_
                );

            add_service_comment(
                service_id_,
                user_id_,
                `Updated service start date time for service ID - ${service_id_} to ${service_start_date_time_}.`
            );

            response.
                status(200).
                json(
                    {
                        message: `Successfully updated service start date time for service_id = '${service_id_}' by user - ${user_id_}`,
                        result: service_start_date_time_result_,
                    }
                );

        }
        catch (error)
        {
            response.
                status(500).
                json(
                    {
                        message: `Could not update service start date timer for customer ID - '${customer_id_}' and service_id = '${service_id_}'`,
                        error: error.message,
                    }
                );
        }

    }
);

module.exports = router;
