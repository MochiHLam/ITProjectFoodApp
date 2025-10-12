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
    const product = await Product.create({ ...req.body, images, createdBy: req.user.id });
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not Found' });
    res.json(updated);
  } catch (err) {
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



