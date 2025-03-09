import mongoose from 'mongoose';
import foodModel from '../models/foodModel.js';
import { config } from 'dotenv';

config();

const products = [
  {
    name: "Guntur Red Chilli Powder",
    description: "Premium Guntur Red Chilli Powder - 250g",
    price: 2650,
    image: "../uploads/1734897478076biryanifull.png",
    category: "chilli-powder"
  },
  {
    name: "Byadgi Red Chilli Powder",
    description: "Premium Byadgi Red Chilli Powder - 250g",
    price: 2650,
    image: "../uploads/1734897478076biryanifull.png",
    category: "chilli-powder"
  },
  {
    name: "Kashmiri Red Chilli Powder",
    description: "Premium Kashmiri Red Chilli Powder - 250g",
    price: 2650,
    image: "../uploads/1734897478076biryanifull.png",
    category: "chilli-powder"
  }
  // Add more products as needed
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete existing products
    await foodModel.deleteMany({});
    console.log('Existing products deleted');

    // Insert new products
    const createdProducts = await foodModel.insertMany(products);
    console.log('Products seeded successfully:', createdProducts);

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedProducts();