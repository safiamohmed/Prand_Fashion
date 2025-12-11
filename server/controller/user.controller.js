const User = require("../models/user.model");
const CatchAsync = require('../utilites/catch_async.utilites');

exports.addUser = (role) => {
  return async (req, res) => {
    const { name, password, email } = req.body;
    try {
      const user = await User.create({ name, password, email, role });
      res.status(201).json({ 
        message: "add new user", 
        data: user 
      });
    } catch (err) {
      res.status(500).json({ 
        message: "error in server", 
        error: err.message 
      });
    }
  };
};

exports.getAllUsers = CatchAsync(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(200).json({ 
    message: "list of all users", 
    data: users 
  });
});

exports.getUserById = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");
  
  if (!user) {
    return res.status(404).json({ 
      message: "User not found" 
    });
  }
  
  res.status(200).json({ 
    message: "User found", 
    data: user 
  });
});

exports.updateUser = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  if (req.user.id !== id && req.user.role !== 'admin') {
    return res.status(403).json({
      message: "You are not authorized to update this user"
    });
  }
  
  const updateData = { name };
  
  if (req.user.role === 'admin' && email) {
    updateData.email = email;
  }
  
  const updatedUser = await User.findByIdAndUpdate(
    id,
    updateData,
    { 
      new: true,
      runValidators: true 
    }
  ).select("-password");
  
  if (!updatedUser) {
    return res.status(404).json({ 
      message: "User not found" 
    });
  }
  
  res.status(200).json({ 
    message: "User updated successfully", 
    data: updatedUser 
  });
});

exports.updatePassword = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  
  if (req.user.id !== id) {
    return res.status(403).json({
      message: "You can only change your own password"
    });
  }
  
  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({ 
      message: "User not found" 
    });
  }
  
  const isCorrectPassword = await user.correctPassword(currentPassword);
  
  if (!isCorrectPassword) {
    return res.status(401).json({
      message: "Current password is incorrect"
    });
  }
  
  user.password = newPassword;
  await user.save();
  
  res.status(200).json({ 
    message: "Password updated successfully" 
  });
});

exports.deleteUser = CatchAsync(async (req, res) => {
  const { id } = req.params;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: "Only admins can delete users"
    });
  }
  
  const deletedUser = await User.findByIdAndDelete(id);
  
  if (!deletedUser) {
    return res.status(404).json({ 
      message: "User not found" 
    });
  }
  
  res.status(200).json({ 
    message: "User deleted successfully" 
  });
});