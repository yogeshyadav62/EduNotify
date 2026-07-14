import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  facultyName: { type: String, required: true },
  category: { type: String, required: true },
  targetType: { type: String, enum: ['class', 'student'], required: true },
  classId: { type: String, ref: 'Class', default: null },
  studentId: { type: String, ref: 'Student', default: null },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  scheduledFor: { type: Date, default: null },
  dateTime: { type: Date, default: Date.now },
  attachmentUrl: { type: String, default: null },
  attachmentType: { type: String, default: null }, // MIME type: e.g. 'image/jpeg', 'application/pdf'
  isDelivered: { type: Boolean, default: false },
  isSeen: { type: Boolean, default: false },
  deliveredAt: { type: Date, default: null },
  seenAt: { type: Date, default: null }
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

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
