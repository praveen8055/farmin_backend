import mongoose from "mongoose";
// import { products } from '../../../frontend/src/constants/index';

const productSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
      },
    name: { type: String},
    description: { type: String, required: true },
    price: { type: Number, required: true},
    quantity: { type: Number, required: true},
    image: { type: String, required: true },
    category:{ type:String, required:true}
})

const productModel = mongoose.models.products || mongoose.model("product", productSchema);
export default productModel;