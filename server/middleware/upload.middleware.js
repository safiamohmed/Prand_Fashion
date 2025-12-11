const multer = require('multer');
const path = require('path')

//get check on file extension

const fileFilter = (req,file,cb)=>{
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.png' , '.jpg' , '.jpeg'];
    if(!allowed.includes(ext)){
        cb(new Error('only Images files are allowed'),false);
    }
    cb(null,true);
}

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads')
    },
    filename:(req,file,cb)=>{
        cb(null, Date.now() + "_" +file.originalname);
    }

});

const MB = 1024 * 1024;
const upload = multer({
    storage,
    fileFilter,
    limits: MB * 2 
});
//limits -> size of the file

module.exports = {upload};