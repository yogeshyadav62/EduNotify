import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "STU-101"
  name: { type: String, required: true },
  classId: { type: String, ref: 'Class', required: true },
  email: { type: String, default: null },
  mobile: { type: String, default: null },
  fcmToken: { type: String, default: null },
  profilePicUrl: { type: String, default: null }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.studentId = ret._id;
      delete ret._id;
    }
  }
});

const Student = mongoose.model('Student', StudentSchema);
export default Student;
