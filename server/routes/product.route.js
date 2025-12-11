const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/upload.middleware.js");
const {
  getAllProducts,
  addProduct,
  getProductBySlug,
  deleteProducts,
  getPaginatedProducts,
  updateProduct
} = require("../controller/productController.js");
const { authenticate } = require("../middleware/auth.middleware.js");
const { authorize } = require("../middleware/role.middleware.js");
const paginate = require("../middleware/pagination.middleware.js");
const Product = require("../models/product.model.js");
router.get("/", getAllProducts);
router.get("/PaginatedProducts", getPaginatedProducts);
//router.post('/',upload.single('img'),addProduct)
router.get("/:slug", getProductBySlug);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.single("img"),
  addProduct
);
// أضف هذا الـ route فقط
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  upload.single("img"), // صورة اختيارية
  updateProduct
);
router.delete("/:id", authenticate, authorize("admin"), deleteProducts);
module.exports = router;

//model => schema and model
//المودل هو حلقه الوصل بين الابلكيشن والداتابيز
//بنعمل المودل وبنديه للكنترول
//الكنترولر هو الى هكتب فيه اللوجكس بتاعتنا والمثودس الى بتتعامل على المودل ده
// خلصنا الكنترول بنروح بقى نسلمه للراوت و نعمل الend points بتاعتنا
//الكنترولر بيروح للراوت والراوت بيروح للسرفر
