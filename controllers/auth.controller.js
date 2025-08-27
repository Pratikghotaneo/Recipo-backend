import mongoose from "mongoose";
import User from "../models/user.model.js";

export const updateUser = (req, res) => {
  const userId = req.user._id;
  const updates = req.body;

  const objectId = new mongoose.Types.ObjectId(userId);

  User.findByIdAndUpdate(objectId, updates, {
    new: true,
    runValidators: true,
  })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({
        message: "User updated successfully",
        data: updatedUser,
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error updating user", error: error.message });
    });
};

export const deleteUser = (req, res) => {
  const userId = req.user._id;

  User.findByIdAndDelete({ _id: userId })
    .then((deletedUser) => {
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({
        message: "User deleted successfully",
        data: deletedUser,
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error deleting user", error: error.message });
    });
};

export const logoutUser = (req, res, next) => {
  res.clearCookie("connect.sid");

  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }

      res.status(200).send({ message: "Logged out successfully" });
    });
  });
};
