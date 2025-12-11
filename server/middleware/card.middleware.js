
const Cart = require("../models/cart.model");

exports.getUserCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    req.cart = cart; 
    next();
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
};
