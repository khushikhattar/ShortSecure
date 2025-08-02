import mongoose, { Document, Types, Schema, Model } from "mongoose";

interface Url extends Document {
  _id: string;
  user_id?: Types.ObjectId;
  long_url: string;
  short_url: string;
  clicks: number;
  createdAt: Date;
}

const urlSchema: Schema<Url> = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    long_url: {
      type: String,
      required: true,
    },
    short_url: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Url: Model<Url> = mongoose.model<Url>("Url", urlSchema);
