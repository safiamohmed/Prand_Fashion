const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const {
  getCart,
  addToCart,
  removeCartItem,
  clearCart,
} = require("../controller/card.controller");

router.get("/", authenticate, getCart);
router.post("/", authenticate, addToCart);
router.post("/remove", authenticate, removeCartItem);
router.delete("/clear", authenticate, clearCart);

module.exports = router;
