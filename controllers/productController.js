import productModel from "../models/productModel.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const listProduct = async (req, res) => {
    try {
        const products = await productModel.find({});
        const productsWithUrls = products.map(product => ({
            ...product._doc,
            image: `http://localhost:5010/uploads/${product.image}`
        }));
        
        res.json({ 
            success: true, 
            data: productsWithUrls
        });
    } catch (error) {
        console.error('List products error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
};

const addProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Product image is required"
            });
        }

        const product = new productModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            category: req.body.category,
            image: req.file.filename
        });

        await product.save();
        
        res.status(201).json({
            success: true,
            message: "Product added successfully",
            data: {
                ...product._doc,
                image: `http://localhost:5010/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to add product"
        });
    }
};

const removeProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting product:', id);

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete image file if it exists
        if (product.image) {
            const imagePath = path.join(__dirname, '..', 'uploads', product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Image deleted:', imagePath);
            }
        }

        await productModel.findByIdAndDelete(id);
        
        res.json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete product"
        });
    }
};

// Export all functions
export { listProduct, addProduct, removeProduct };