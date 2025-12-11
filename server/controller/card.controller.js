const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart) return res.status(404).json({ 
      message: "Cart empty",
      data: null 
    });
    res.status(200).json({ 
      message: "Cart retrieved successfully",
      data: cart 
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      data: null 
    });
  }
};

exports.addToCart = async (req, res) => {
  const { name, quantity } = req.body;

  try {
    const product = await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      isDeleted: false,
    });
    if (!product) return res.status(404).json({ 
      message: "Product not found",
      data: null 
    });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === product._id.toString()
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].price = product.price;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
      });
    }

    await cart.save();
    const populated = await cart.populate("items.product");
    res.status(200).json({ 
      message: "Product added to cart successfully",
      data: populated 
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      data: null 
    });
  }
};

exports.removeCartItem = async (req, res) => {
  const { name } = req.body;

  try {
    const product = await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      isDeleted: false,
    });
    if (!product) return res.status(404).json({ 
      message: "Product not found",
      data: null 
    });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ 
      message: "Cart not found",
      data: null 
    });

    const before = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== product._id.toString()
    );

    if (cart.items.length === before)
      return res.status(404).json({ 
        message: "Product not in cart",
        data: null 
      });

    await cart.save();
    const populated = await cart.populate("items.product");
    res.status(200).json({ 
      message: "Product removed from cart successfully",
      data: populated 
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      data: null 
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const deleted = await Cart.findOneAndDelete({ user: req.user._id });
    if (!deleted) return res.status(404).json({ 
      message: "Cart not found",
      data: null 
    });

    res.status(200).json({ 
      message: "Cart removed completely",
      data: null 
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      data: null 
    });
  }
};