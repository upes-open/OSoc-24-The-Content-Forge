const s3 = require('../config/s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

const uploadFile = upload.single('file');

const uploadToS3 = (req, res) => {
  uploadFile(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'File uploaded successfully! ', file: req.file });
  });
};

module.exports = { uploadToS3 };
