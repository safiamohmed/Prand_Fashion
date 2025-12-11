const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { getAllSubCategories, addSubCategory,  getbyslugSubCategories,deleteSubCategory ,updateSubCategory} = require("../controller/subCategories.controller");

router.get("/", getAllSubCategories);
router.post("/", authenticate, authorize("admin"), addSubCategory);
router.get("/:slug", getbyslugSubCategories);
router.delete("/:id", authenticate, authorize("admin"), deleteSubCategory);
router.put("/:id", authenticate, authorize("admin"), updateSubCategory);


module.exports = router;
