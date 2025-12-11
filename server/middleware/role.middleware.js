exports.authorize = (...allwebRoles) => {
    return (req, res, next) => {
        const role = req.user.role;
        if (allwebRoles.includes(role)) {
            return next();
            
        }
        return res.status(403).json({message:'error,access denied'})
        
    }
}
// authorize('user','admin') 
