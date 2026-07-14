import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., "CS-101"
  name: { type: String, required: true }
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

const Class = mongoose.model('Class', ClassSchema);
export default Class;
