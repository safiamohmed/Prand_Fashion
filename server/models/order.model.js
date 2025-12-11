const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    purchaseAt: {
      type: Date,
      default: Date.now,
    },
    address: String,
    phonenumber: String,
    status: {
      type: String,
      enum: ["pending", "shipped", "canceled", "delivered", "rejected"],
      default: "pending",
    },
    lastUpdatedBy: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      action: String
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

// تحديث: السماح للمستخدم بالتعديل إذا الحالة pending فقط
orderSchema.methods.canUserModify = function(userId) {
  // المستخدم يمكنه التعديل فقط إذا:
  // 1. هو صاحب الطلب
  // 2. الحالة pending فقط
  return this.user.toString() === userId.toString() && 
         this.status === 'pending';
};

// تحديث: السماح للمستخدم بالإلغاء إذا الحالة pending فقط
orderSchema.methods.canUserCancel = function(userId) {
  // المستخدم يمكنه الإلغاء فقط إذا:
  // 1. هو صاحب الطلب
  // 2. الحالة pending فقط
  return this.user.toString() === userId.toString() && 
         this.status === 'pending';
};

// دالة مساعدة للتحقق مما إذا كان المستخدم يمكنه رؤية/إدارة الطلب
orderSchema.methods.canUserManage = function(userId, userRole) {
  if (userRole === 'admin') return true;
  return this.user.toString() === userId.toString();
};

module.exports = mongoose.model("Order", orderSchema);