import mongoose, { Schema, Types, Document, Model } from "mongoose";
import jwt from "jsonwebtoken";
import ms from "ms";
import bcrypt from "bcryptjs";
interface User extends Document {
  _id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  refreshToken: string[];
  urlList: Types.ObjectId[];
  createdAt?: Date;
  avatar?: string;
  updatedAt?: Date;
  genAccessToken: () => string;
  genRefreshToken: () => string;
  comparePassword: (password: string) => Promise<Boolean>;
}

const userSchema: Schema<User> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      minlength: 6,
      match: /^[a-zA-Z0-9#@_]{6,12}$/,
      maxlength: 12,
    },
    email: {
      type: String,
      required: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    refreshToken: [
      {
        type: String,
      },
    ],
    urlList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Url",
      },
    ],
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.methods.genAccessToken = function (): String {
  return jwt.sign(
    { _id: this._id },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue }
  );
};

userSchema.methods.genRefreshToken = function (): String {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue }
  );
};

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 15);
  return next();
});

export const User: Model<User> = mongoose.model<User>("User", userSchema);
