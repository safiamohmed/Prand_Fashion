const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
    {
name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  parent: {  // ✅ للـ SubCategory فقط
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    

  
    
  
    },
    {
        timestamps:true
    }
);

module.exports = mongoose.model("SubCategory", subCategorySchema);
