const express = require("express");
const router = express.Router();

require("dotenv").config();
const CryptoJS = require("crypto-js");

const {
    validate_http_body_arguments,
} = require("../lib/lib.middleware");

const {
    validate_user_registration_by_email_password,
    register_user_with_email_otp,
    sign_up_user_with_email
} = require("../src/src.users");

router.post(
    "/signup",
    validate_http_body_arguments([
        "full_name",
        "email",
        "password",
        "phone_num",
        "user_type"
    ]),
    async (request, response) =>
    {
        const full_name_ = request.body.full_name;
        const email_ = request.body.email;
        const password_ = CryptoJS.AES.encrypt(
            request.body.password,
            process.env.AUTH_SECRET
        ).toString();
        const phone_number_ = request.body.phone_num;
        const user_type_ = request.body.user_type;
        
        try
        {
            const sign_up_res_ = await sign_up_user_with_email(
                email_,
                {
                    user_name__c: email_,
                    full_name__c: full_name_,
                    email__c: email_,
                    password__c: password_,
                    phone_number__c: phone_number_,
                    user_type__c: user_type_,
                    registered__c: false,
                }
            );

            if (sign_up_res_.status !== "success")
            {
                response.
                    status(500).
                    json(
                        {
                            message: `Could not sign up user for email - ${email_}`,
                            sign_up_result: sign_up_res_,
                        }
                    );
                return;
            }

            response.
                status(200).
                json(
                    {
                        message: `Successfully signed up user for email - ${email_}. Awaiting OTP validation.`,
                        sign_up_result: sign_up_res_,
                    }
                );

        }

        catch (error)
        {
            response.status(500).json(
                {
                    message: "An unexpected error ocurred",
                    error: error.message
                }
            );
        }

    }
);

router.post(
    '/signin',
    validate_http_body_arguments(["email", "password"]),
    async (request, response) =>
    {
        const email_ = request.body.email;
        const password_ = request.body.password;

        try
        {
            const signin_result = await validate_user_registration_by_email_password(email_, password_);

            if (signin_result.status === "fail")
            {
                response.
                    status(400).
                    json(
                        {
                            message: "An error ocurred.",
                            signin_result: signin_result,
                        }
                    );

                return;
            }

            response.
                status(200).
                json(
                    {
                        message: "Successfully validated user!",
                        signin_result: signin_result,
                    }
                );

        }
        catch (error)
        {
            response.status(500).json(
                {
                    message: "An unexpected error has ocurred",
                    error: error.message
                }
            );
        }

    }
);

// Verify OTP
router.post(
    '/verify-otp-user-registration',
    validate_http_body_arguments(["email", "otp"]),
    async (request, response) =>
    {
        const email_ = request.body.email;
        const otp_ = request.body.otp;

        try
        {
            const register_result_ = await register_user_with_email_otp(email_, otp_);

            if (register_result_.status !== "success")
            {
                response.
                    status(500).
                    json(
                        {
                            message: `Could not register user with email - ${email_}.`,
                            register_result: register_result_,
                        }
                    );
                return;
            }

            response.
                status(200).
                json(
                    {
                        message: `User for email ID - ${request.body.email} successfully registered.`,
                        register_result: register_result_,
                    }
                );

        }
        catch (error)
        {
            response.
                status(500).
                json(
                    {
                        message: "An unexpected error has ocurred",
                        error: error.message,
                    }
                );
        }

    });

const passport = require("../utils/utils.google_oauth");

router.get(
    "/google",
    passport.authenticate(
        "google",
        { scope: ["profile", "email"] }
    )
);

router.get(
    "/google/callback",
    passport.authenticate(
        "google",
        { failureRedirect: '/' }
    ),
    (request, response) =>
    {
        // Successful authentication; redirect or respond as needed
        response.redirect('/');
    }
);

module.exports = router;
