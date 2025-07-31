import multer from "multer";

const multerUpload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5, 
  },
  storage: multer.memoryStorage(),
});

const singleAvatar = multerUpload.single("avatar");
const attachmentsMulter = multerUpload.array("files", 8);
const postImageUpload = multerUpload.single("postImg");

export { singleAvatar, attachmentsMulter,postImageUpload };





// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); 
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   },
// });

// // File filter for validating the image type
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Not an image!'), false); 
//   }
// };

// // Multer setup
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
// });

