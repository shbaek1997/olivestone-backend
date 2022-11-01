const multer = require("multer");
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, callback) {
    const { originalname } = file;
    const newName = originalname + "-" + Date.now();
    //use some id feature here
    callback(null, newName);
  },
});

const upload = multer({
  storage: storage,
});

module.exports = upload;
