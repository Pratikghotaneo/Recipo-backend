import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Enter valid email address"],
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      minLength: [6, "Password must be at least 6 characters"],
      maxLength: [100, "Password cannot be more than 100 characters"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      required: [true, "Provider is required"],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.password) {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }

  next();
});

const User = mongoose.model("User", userSchema);

export default User;
