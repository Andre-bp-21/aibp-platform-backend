import mongoose, { Schema, Document } from 'mongoose';

export interface IBusiness extends Document {
  userId: string;
  name: string;
  industry: string;
  revenue: number;
  costs: number;
  team_size: number;
  sales_channel: string;
  score?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    revenue: {
      type: Number,
      required: true,
      min: 0,
    },
    costs: {
      type: Number,
      required: true,
      min: 0,
    },
    team_size: {
      type: Number,
      required: true,
      min: 1,
    },
    sales_channel: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBusiness>('Business', businessSchema);
