const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    tags: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Text index for fast search on name and tags
ProductSchema.index({ name: 'text', tags: 'text' })

module.exports = mongoose.model('Product', ProductSchema);



