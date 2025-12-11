const Testimonial = require('../models/testimonial.model');
const User = require('../models/user.model');

exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(10); 

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonials',
      error: error.message
    });
  }
};

exports.addTestimonial = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const testimonial = await Testimonial.create({
      user: req.user._id,
      rating,
      comment
    });

    const newTestimonial = await Testimonial.findById(testimonial._id)
      .populate('user', 'name email avatar');

    res.status(201).json({
      success: true,
    //  message: 'Testimonial added successfully',
      data: newTestimonial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding testimonial',
      error: error.message
    });
  }
};

exports.deactivateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    if (testimonial.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    testimonial.isActive = false;
    testimonial.updatedAt = Date.now();
    await testimonial.save();

    res.status(200).json({
      success: true,
      message: 'Testimonial deactivated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating testimonial',
      error: error.message
    });
  }
};