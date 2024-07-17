import multer from 'multer';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'upload');
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${file.originalname}`);
    }
  })
});


export default upload;
