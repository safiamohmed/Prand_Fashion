const { getSalesReport } = require('../controller/sales_report.controller');
const express = require('express')
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();
router.get('/',authenticate,authorize('admin'),getSalesReport)
module.exports = router;
