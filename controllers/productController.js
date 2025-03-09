import productModel from "../models/productModel.js";
import fs from 'fs'

// all food list
const listProduct = async (req, res) => {
    try {
        const products = await productModel.find({})
        res.json({ success: true, data: products })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

// add food
const addProduct = async (req, res) => {

    try {
        let image_filename = `${req.file.filename}`

        const product = new productModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category:req.body.category,
            image: image_filename,
        })

        await product.save();
        res.json({ success: true, message: "Product Added" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// delete food
const removeProduct = async (req, res) => {
    try {

        const productId = req.body.id;
        console.log('Product ID:', productId);
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // First check if product exists
        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete image file if it exists
        if (product.image) {
            const imagePath = `uploads/${product.image}`;
            try {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log('Product image deleted:', imagePath);
                }
            } catch (error) {
                console.error('Error deleting image:', error);
            }
        }

        // Delete the product
        const deletedProduct = await productModel.findByIdAndDelete(productId);
        
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product could not be deleted"
            });
        }

        console.log('Product deleted successfully:', productId);
        res.status(200).json({
            success: true,
            message: "Product removed successfully"
        });

    } catch (error) {
        console.error('Remove product error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error removing product"
        });
    }
};

export { listProduct, addProduct, removeProduct }