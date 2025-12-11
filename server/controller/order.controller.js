const mongoose = require("mongoose");
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user._id;
    const { address, phonenumber } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({
        message: "Cart is empty",
        data: null,
      });

    const orderItems = [];

    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new Error(
          `Product ${item.product.name} has only ${item.product.stock} in stock`
        );
      }

      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } },
        { session }
      );

      orderItems.push({
        user: userId,
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.quantity * item.price,
        address,
        phonenumber,
        lastUpdatedBy: {
          user: userId,
          action: "create",
        },
      });
    }

    const orders = await Order.create(orderItems, { session, ordered: true });
    await Cart.findOneAndDelete({ user: userId }, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Order created successfully",
      data: orders,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: err.message,
      data: null,
    });
  }
};

exports.getAllOrder = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("product", "name price imgURL stock")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All orders retrieved",
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      data: null,
    });
  }
};

exports.getUserOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .populate("product", "name price imgURL stock")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "User orders retrieved",
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      data: null,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const allowedStatuses = [
      "pending",
      "shipped",
      "canceled",
      "delivered",
      "rejected",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
        data: null,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        data: null,
      });
    }

    // إذا كان المستخدم يحاول إلغاء طلب pending كـ admin
    if (
      req.user.role === "admin" &&
      order.status === "pending" &&
      status === "canceled"
    ) {
      // استعادة المخزون
      await Product.findByIdAndUpdate(order.product, {
        $inc: { stock: order.quantity },
      });
    }

    // تحديث الحالة
    order.status = status;
    order.lastUpdatedBy = {
      user: userId,
      action: "status_change",
      timestamp: new Date(),
    };

    await order.save();

    const populated = await order.populate("product user");

    res.status(200).json({
      message: "Order status updated",
      data: populated,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      data: null,
    });
  }
};

// دالة جديدة: تحديث بيانات الطلب (للمستخدم)
exports.updateUserOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { address, phonenumber } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        data: null,
      });
    }

    // التحقق من صلاحية التعديل - فقط pending
    if (!order.canUserModify(userId)) {
      return res.status(403).json({
        message:
          "You cannot modify this order. Only pending orders can be modified.",
        data: null,
      });
    }

    // تحديث البيانات
    if (address) order.address = address;
    if (phonenumber) order.phonenumber = phonenumber;

    order.lastUpdatedBy = {
      user: userId,
      action: "update",
      timestamp: new Date(),
    };

    await order.save();

    const populated = await order.populate("product");

    res.status(200).json({
      message: "Order updated successfully",
      data: populated,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      data: null,
    });
  }
};

// دالة جديدة: إلغاء الطلب (للمستخدم)
exports.cancelUserOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "Order not found",
        data: null,
      });
    }

    // التحقق من صلاحية الإلغاء - فقط pending
    if (!order.canUserCancel(userId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: `You cannot cancel this order. Only pending orders can be canceled. Current status: ${order.status}`,
        data: null,
      });
    }

    // استعادة المخزون
    await Product.findByIdAndUpdate(
      order.product,
      { $inc: { stock: order.quantity } },
      { session }
    );

    // تحديث حالة الطلب
    order.status = "canceled";
    order.lastUpdatedBy = {
      user: userId,
      action: "cancel",
      timestamp: new Date(),
    };

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populated = await order.populate("product");

    res.status(200).json({
      message: "Order canceled successfully",
      data: populated,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: err.message,
      data: null,
    });
  }
};

// دالة جديدة: الحصول على تفاصيل طلب معين
exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const order = await Order.findById(id)
      .populate("product", "name price imgURL stock")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        data: null,
      });
    }

    // التحقق من صلاحية الوصول
    if (!order.canUserManage(userId, userRole)) {
      return res.status(403).json({
        message: "Access denied",
        data: null,
      });
    }

    res.status(200).json({
      message: "Order details retrieved",
      data: order,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      data: null,
    });
  }
};

// دالة جديدة: الحصول على إحصائيات طلبات المستخدم
exports.getUserOrderStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Order.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments({ user: userId });
    const pendingOrders = await Order.countDocuments({
      user: userId,
      status: "pending",
    });

    res.status(200).json({
      message: "Order statistics retrieved",
      data: {
        stats,
        totalOrders,
        pendingOrders,
        canCancel: pendingOrders > 0,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      data: null,
    });
  }
};
