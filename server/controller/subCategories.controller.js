const SubCategory = require("../models/subCategory.model");

exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ isDeleted: false })
      .populate('parent', 'name slug'); 
    res.status(200).json({ message: "All sub categories", data: subCategories });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.addSubCategory = async (req, res) => {
  try {
    const { name, slug, parent } = req.body;
    const subCategory = await SubCategory.create({ 
      name, 
      slug, 
      parent: parent || null 
    });
    res.status(201).json({ 
      message: "Sub Category created successfully", 
      data: subCategory 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getbyslugSubCategories = async (req, res) => {
  try {
    const slug = req.params.slug;
    const category = await SubCategory.findOne({ slug });
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
exports.deleteSubCategory = async (req, res) => {
  const id = req.params.id;
  const subcategory = await SubCategory.findByIdAndUpdate(id, { isDeleted: true });
  if (subcategory) {
    res.status(200).json({ message: "sub category deleted", data: subcategory });
  } else {
    res.status(404).json({ message: "error,Sub category not found" });
  }
};
exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, parent } = req.body;

    // التحقق من وجود الـ SubCategory
    const existingSubCategory = await SubCategory.findById(id);
    if (!existingSubCategory) {
      return res.status(404).json({ 
        message: "Sub category not found" 
      });
    }

    // التحقق من أن الـ slug غير مكرر (إذا تم تغييره)
    if (slug && slug !== existingSubCategory.slug) {
      const slugExists = await SubCategory.findOne({ 
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
    if (parent !== undefined) {
      updateData.parent = parent === '' || parent === null ? null : parent;
    }

    // تحديث الـ SubCategory
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,  // إرجاع الوثيقة بعد التحديث
        runValidators: true  // تشغيل التحقق من البيانات
      }
    ).populate('parent', 'name slug');

    if (!updatedSubCategory) {
      return res.status(404).json({ 
        message: "Sub category not found" 
      });
    }

    res.status(200).json({ 
      message: "Sub category updated successfully", 
      data: updatedSubCategory 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};