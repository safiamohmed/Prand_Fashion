// في productController.js - تحديث getPaginatedProducts
exports.getPaginatedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Get sorting
    const sortBy = req.query.sort || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    
    // Get filters
    const category = req.query.category;
    const subCategory = req.query.subCategory;
    const search = req.query.search;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    
    // Build query
    let query = { isDeleted: false };
    
    if (category) {
      query.category = category;
    }
    
    if (subCategory) {
      query.subCategory = subCategory;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { desc: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Execute query with pagination
    const [products, total] = await Promise.all([
      product.find(query)
        .populate('category', 'name slug')
        .populate('subCategory', 'name slug')
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit),
      product.countDocuments(query)
    ]);
    
    res.status(200).json({
      message: "Paginated products",
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};