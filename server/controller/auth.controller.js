const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const signToken = (user) => {
  return jwt.sign({
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email
  },
      process.env.SECRET_KEY,
      {expiresIn:process.env.jwt_EXPIRES_IN}
  
  );
};
//بستخدم ال body مش ال params عشان ال params حساسه مينفعش حد يشوفها
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const myUser = await User.findOne({ email });
  if (!myUser) {  
    return res
      .status(404)
      .json({ message: "erorr, invalid email or password" });
  }
  const correctPassword = await myUser.correctPassword(password);
 
  if (!correctPassword) {
    return res
      .status(401)
      .json({ message: "erorr, invalid email or password" });
    }
    const token = signToken(myUser);
    res.status(200).json({ message: "login succesful", data: token});
};
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
        console.log('Signup request received:', { name, email }); // إضافة log

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email"
      });
    }

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: 'user' 
    });
        console.log('User created successfully:', user._id); // إضافة log


    res.status(201).json({
      message: "User created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
        console.error('Signup error:', err); // إضافة log

    res.status(500).json({
      message: "Error creating user",
      error: err.message
    });
  }
};
