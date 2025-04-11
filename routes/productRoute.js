import express from 'express';
import { addProduct, listProduct, removeProduct } from '../controllers/productController.js';
import multer from 'multer';
const productRouter = express.Router();

//Image Storage Engine (Saving Image to uploads folder & rename it)

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null,`${Date.now()}${file.originalname}`);
    }
})

const upload = multer({ storage: storage})

// API Routes
productRouter.get("/list",listProduct);
productRouter.post("/add",upload.single('image'),addProduct);
productRouter.delete("/remove/:id", removeProduct); // Updated route

export default productRouter;