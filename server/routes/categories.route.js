const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { getAllCategories, addCategory,  getbyslugCategories,deleteCategory,updateCategory } = require("../controller/categories.controller");

router.get("/",  getAllCategories);
router.post("/", authenticate, authorize("admin"), addCategory);
router.get("/:slug", getbyslugCategories);
router.delete("/:id", authenticate, authorize("admin"), deleteCategory);
router.put("/:id", authenticate, authorize("admin"), updateCategory);


module.exports = router;
