import express from "express";
import multer from "multer";
import path from "path";
const router = express.Router();

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Images Only");
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Send back base64 + contentType so the frontend can hold onto it
  // and submit it along with the rest of the product form
  res.json({
    data: req.file.buffer.toString("base64"),
    contentType: req.file.mimetype,
  });
});

export default router;
