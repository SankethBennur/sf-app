const express = require("express");
const router = express.Router();

router.get("/service", async (request, response)=>{
    const service_id = request.query.service_id;

    response.
        status(200).
        json(
            {}
        );

});

router.post("/service", async (request, response)=>{
    const service_id = request.query.service_id;

    const comment = request.body.comment;

    response.
        status(200).
        json(
            {}
        );

});

module.exports = router;
