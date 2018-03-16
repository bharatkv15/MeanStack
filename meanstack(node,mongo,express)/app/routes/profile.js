var express             = require('express');
var profileRouter       = express.Router();
var multer              = require('multer');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  });
   
  var upload = multer({ storage: storage }).single('profileImage');

 
  profileRouter.post('/', function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      // An error occurred when uploading 
      return
    }
 
    // Everything went fine 
  })
});


module.exports = profileRouter;