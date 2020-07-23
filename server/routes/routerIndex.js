const express = require("express");
const router = express.Router();

const adminRoute = require("./RAdmin");
const builderRoute = require("./RBuilder");

router.use("/api/admin", adminRoute);
router.use("/api/builder", builderRoute);

module.exports = router;
