const product = require("../models/product.model");
// const memoryCache = require('../utilites/cache.utilites')
// const logger = require('../utilites/logger.utilites')

exports.getAllProducts = async (req, res) => {

  const products = await product.find({ isDeleted: false });
 
  try {
    res.status(200).json({ message: "all products", data: products });
  }
  catch (err) {
  res.status(500).json({ message: 'Server error', error: err.message });
}
};
exports.getPaginatedProducts = (req, res) => {
      res.status(200).json(res.paginatedResult);

}
//هنا هدخله بأديا انما اصلا فى حاجه بتهندل الموضوع ده اسمها slugify
exports.getProductBySlug = async (req, res) => {
  const slug = req.params.slug;
  const productt = await product.findOne({ slug });
  if (productt) {
    res.status(200).json({ message: `product (${slug} info)`, data: productt });
  } else {
    res.status(404).json({ message: "Error, product not found" });
    
  }
};

exports.addProduct = async (req, res) => {
  const { name, desc, price, stock, slug ,category,subCategory} = req.body;
  const imgURL = req.file.filename;
  const myProduct = await product.create({
    name,
    desc,
    price,
    stock,
    slug,
    imgURL,
     category: category || null,
      subCategory: subCategory || null
  });
  //memoryCache.del(cacheKey)
  res
    .status(201)
    .json({ message: "product created successfully", data: myProduct });
};

exports.deleteProducts = async (req, res) => {
  const id = req.params.id;
  const products = await product.findByIdAndUpdate(id, { isDeleted: true });
  if (products) {
    res.status(200).json({ message: "product deleted", data: products });
  } else {
    res.status(404).json({ message: "error,product not found" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, desc, price, stock, slug, category, subCategory } = req.body;
    
    const updateData = { name, desc, price, stock, slug, category, subCategory };
    
    if (req.file) {
      updateData.imgURL = req.file.filename;
    }
    
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.stock) updateData.stock = Number(updateData.stock);
    
    const updatedProduct = await product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(200).json({ 
      message: "Product updated successfully", 
      data: updatedProduct 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Failed to update product", 
      error: err.message 
    });
  }
};