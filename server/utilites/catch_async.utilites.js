module.exports = fn => (req, res, next) => { //بتاخد اي فانكشن عندي في الكنترولر
    fn(req,res,next).catch(next)//)ظظبتاخد فانكشن اللي هي بروميس ترجع نفس الفانكشن معاها كاتش

}