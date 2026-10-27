import mongoose, { Schema } from 'mongoose';
const options = { timestamps: true };
const contentSchema = new Schema(
  {
    kind: { type: String, required: true, index: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    data: { type: Schema.Types.Mixed, default: {} },
    published: { type: Schema.Types.Mixed, default: null },
    publishedAt: Date,
    updatedBy: String,
  },
  options,
);
contentSchema.index({ kind: 1, slug: 1 }, { unique: true });
export const Content = mongoose.model('Content', contentSchema);
export const User = mongoose.model(
  'User',
  new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      password: { type: String, required: true, select: false },
      role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
      active: { type: Boolean, default: true },
      sessionVersion: { type: Number, default: 0 },
      resetHash: { type: String, select: false },
      resetExpires: Date,
    },
    options,
  ),
);
export const Session = mongoose.model(
  'Session',
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, required: true },
      hash: { type: String, required: true, unique: true },
      expires: { type: Date, required: true, index: { expires: 0 } },
    },
    options,
  ),
);
export const Submission = mongoose.model(
  'Submission',
  new Schema(
    {
      kind: {
        type: String,
        enum: ['messages', 'applications', 'subscribers'],
        required: true,
        index: true,
      },
      name: String,
      email: { type: String, required: true },
      phone: String,
      company: String,
      service: String,
      budget: String,
      message: String,
      job: String,
      portfolio: String,
      linkedin: String,
      resume: String,
      status: { type: String, default: 'new' },
      notes: { type: String, default: '' },
    },
    options,
  ),
);
export const Media = mongoose.model(
  'Media',
  new Schema(
    {
      publicId: { type: String, required: true },
      url: { type: String, required: true },
      name: String,
      alt: String,
      mime: String,
      bytes: Number,
      width: Number,
      height: Number,
      resourceType: String,
      private: { type: Boolean, default: false },
      owner: String,
    },
    options,
  ),
);
export const Activity = mongoose.model(
  'Activity',
  new Schema({ actor: String, action: String, target: String }, options),
);
