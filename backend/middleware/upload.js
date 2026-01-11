import multer from 'multer';
import path from 'path';

// Configure multer for memory storage (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();

// File filter to accept images and PDFs
const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const pdfType = /pdf/;
  const extname = path.extname(file.originalname).toLowerCase();
  
  const isImage = imageTypes.test(extname) && imageTypes.test(file.mimetype);
  const isPDF = pdfType.test(extname) && file.mimetype === 'application/pdf';

  if (isImage || isPDF) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) and PDF files are allowed!'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size (increased for PDFs)
  },
  fileFilter: fileFilter,
});

export default upload;
