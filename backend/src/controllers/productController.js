const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const { buildQueryOptions } = require('../utils/pagination');

exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const images = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((f) => images.push(`/uploads/${f.filename}`));
    }
    
    // Parse tags if provided as JSON string
    const productData = { ...req.body };
    console.log('Received tags:', productData.tags, 'Type:', typeof productData.tags);
    
    if (productData.tags !== undefined) {
      if (typeof productData.tags === 'string') {
        try {
          const parsed = JSON.parse(productData.tags);
          // Ensure it's an array
          productData.tags = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If parsing fails, treat as single tag or split by comma
          if (productData.tags.includes(',')) {
            productData.tags = productData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
          } else {
            productData.tags = [productData.tags.trim()];
          }
        }
      } else if (Array.isArray(productData.tags)) {
        // If already an array, ensure all items are strings
        productData.tags = productData.tags.map(tag => {
          if (typeof tag === 'string') {
            // Check if it's a JSON string that needs parsing
            if (tag.startsWith('[') && tag.endsWith(']')) {
              try {
                const parsed = JSON.parse(tag);
                return Array.isArray(parsed) ? parsed : tag;
              } catch (e) {
                return tag;
              }
            }
            return tag;
          }
          return String(tag);
        }).flat().filter(tag => tag && tag.length > 0);
      }
    }
    
    console.log('Processed tags:', productData.tags);
    
    const product = await Product.create({ ...productData, images, createdBy: req.user.id });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { filter, sort, page, limit } = buildQueryOptions(req.query, ['name', 'tags']);
    const query = Product.find(filter);
    const total = await Product.countDocuments(filter);
    const items = await query
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    res.json({ items, total, page, limit });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not Found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    console.log('Update product request:', {
      id: req.params.id,
      body: req.body,
      files: req.files ? req.files.map(f => ({ filename: f.filename, originalname: f.originalname })) : 'no files'
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const updateData = { ...req.body };
    
    // Parse tags if provided as JSON string
    console.log('Update - Received tags:', updateData.tags, 'Type:', typeof updateData.tags);
    
    if (updateData.tags !== undefined) {
      if (typeof updateData.tags === 'string') {
        try {
          const parsed = JSON.parse(updateData.tags);
          // Ensure it's an array
          updateData.tags = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If parsing fails, treat as single tag or split by comma
          if (updateData.tags.includes(',')) {
            updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
          } else {
            updateData.tags = updateData.tags.trim() ? [updateData.tags.trim()] : [];
          }
        }
      } else if (Array.isArray(updateData.tags)) {
        // If already an array, ensure all items are strings and flatten if needed
        updateData.tags = updateData.tags.map(tag => {
          if (typeof tag === 'string') {
            // Check if it's a JSON string that needs parsing
            if (tag.startsWith('[') && tag.endsWith(']')) {
              try {
                const parsed = JSON.parse(tag);
                return Array.isArray(parsed) ? parsed : tag;
              } catch (e) {
                return tag;
              }
            }
            return tag;
          }
          return String(tag);
        }).flat().filter(tag => tag && tag.length > 0);
      }
      // If tags is an empty string or empty array, set to empty array
      if (updateData.tags === '' || (Array.isArray(updateData.tags) && updateData.tags.length === 0)) {
        updateData.tags = [];
      }
    } else {
      // If tags not provided, don't update it (keep existing tags)
      delete updateData.tags;
    }
    
    console.log('Update - Processed tags:', updateData.tags);
    
    // Handle image uploads
    if (req.files && Array.isArray(req.files)) {
      console.log('Processing uploaded files:', req.files.length);
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      console.log('New image paths:', newImages);
      
      // Get current product to merge images
      const currentProduct = await Product.findById(req.params.id);
      console.log('Current product:', currentProduct ? { id: currentProduct._id, images: currentProduct.images } : 'not found');
      
      if (currentProduct) {
        updateData.images = [...(currentProduct.images || []), ...newImages];
        console.log('Merged images:', updateData.images);
      } else {
        updateData.images = newImages;
        console.log('New product images:', updateData.images);
      }
    }
    
    console.log('Final update data:', updateData);
    
    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not Found' });
    
    console.log('Updated product:', { id: updated._id, images: updated.images });
    res.json(updated);
  } catch (err) {
    console.error('Update product error:', err);
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not Found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

// Upload additional images to existing product
exports.uploadProductImages = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const newImages = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((f) => newImages.push(`/uploads/${f.filename}`));
    }
    
    // Add new images to existing images array
    const updatedImages = [...(product.images || []), ...newImages];
    
    const updated = await Product.findByIdAndUpdate(
      req.params.id, 
      { images: updatedImages }, 
      { new: true }
    );
    
    res.json({ images: updated.images });
  } catch (err) {
    next(err);
  }
};



