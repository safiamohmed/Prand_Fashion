const Category = require("../models/categories.model");

exports.addCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const category = await Category.create({ name, slug });
    res
      .status(201)
      .json({ message: "Category created successfully", data: category });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false });
    res.status(200).json({ message: "All categories", data: categories });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    // التحقق من وجود الـ SubCategory
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ 
        message: "category not found" 
      });
    }

    // التحقق من أن الـ slug غير مكرر (إذا تم تغييره)
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await Category.findOne({ 
        slug, 
        _id: { $ne: id } 
      });
      
      if (slugExists) {
        return res.status(400).json({ 
          message: "Slug already exists" 
        });
      }
    }

    // إعداد بيانات التحديث
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
   

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,  // إرجاع الوثيقة بعد التحديث
        runValidators: true  // تشغيل التحقق من البيانات
      }
    ).populate( 'name slug');

    if (!updatedCategory) {
      return res.status(404).json({ 
        message: "category not found" 
      });
    }

    res.status(200).json({ 
      message: "category updated successfully", 
      data: updatedCategory 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};
exports.getbyslugCategories = async (req, res) => {
  try {
    const slug = req.params.slug;
    const category = await Category.findOne({ slug });
    if (category) {
      res
        .status(200)
        .json({ message: `Category (${slug}) info`, data: category });
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.deleteCategory = async (req, res) => {
  const id = req.params.id;
  const category = await Category.findByIdAndUpdate(id, { isDeleted: true });
  if (category) {
    res.status(200).json({ message: "category deleted", data: category });
  } else {
    res.status(404).json({ message: "error,category not found" });
  }
};
