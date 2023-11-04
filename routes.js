const express = require('express');
const router = express.Router();

router.use("/auth", require("./controllers/controller.auth"));
router.use("/users", require("./controllers/controller.users"));
router.use("/products", require("./controllers/controller.products"));

router.use("/services", require("./controllers/controller.services"));
router.use("/service/status", require("./controllers/controller.service_status"));
router.use("/purchases", require("./controllers/controller.purchases"));

router.use("/uploads", require("./controllers/controller.uploads"));
router.use("/agent", require("./controllers/controller.agent"));
router.use("/order", require("./controllers/controller.order"));

router.use("/push-notifications", require("./controllers/controller.push_notifications"));
router.use("/users/address/", require("./controllers/controller.user_address"));
router.use("/notifications/", require("./controllers/controller.notifications"));

module.exports = router;
