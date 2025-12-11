const jwt = require('jsonwebtoken')
const User = require('../models/user.model');
exports.authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
       return res.status(401).json({message:'erorr,no token found'})
        

    }
    const token = authHeader.split(' ')[ 1 ];
    try {

        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        // console.log(authHeader);
        //ياخد id من التوكين
        const userId = decoded.id;
        const myUser = await User.findById(userId).select('-password');
        if (myUser) {
            req.user = myUser;
            return next()
        }
        return res.status(401).json({message:'invalid token'})
    }
    catch (err) {
          return res.status(401).json({ message: 'invalid or expired token' });

        
    }
}