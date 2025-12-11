const express = require('express');
const router = express.Router();
const {
  addUser,
  getAllUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser
} = require('../controller/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.post('/', addUser('user'));

router.get('/', authenticate, authorize('admin'), getAllUsers);

router.get('/:id', authenticate, getUserById);

router.put('/:id', authenticate, updateUser);

router.put('/:id/password', authenticate, updatePassword);

router.delete('/:id', authenticate, authorize('admin'), deleteUser);

router.get('/me/profile', authenticate, (req, res) => {
  res.status(200).json({
    message: "Current user profile",
    data: req.user
  });
});

module.exports = router;