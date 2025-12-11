const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getTestimonials,
  addTestimonial,
  deactivateTestimonial
} = require('../controller/testimonial.controller');

// أي شخص يمكنه رؤية التوصيات
router.get('/', getTestimonials);

// إضافة توصية جديدة (تتطلب تسجيل دخول)
router.post('/', authenticate, addTestimonial);

// إلغاء تفعيل التوصية (للمسؤول أو صاحب التوصية)
router.patch('/:id/deactivate', authenticate, deactivateTestimonial);

module.exports = router;