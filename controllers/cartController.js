import userModel from "../models/userModel.js"
const addToCart = async (req, res) => {
   try {
    //  console.log('Request body:', req.body);
    //  console.log('User from token:', req.user);
 
     if (!req.body.itemId) {
       return res.status(400).json({ 
         success: false, 
         message: "Item ID is required" 
       });
     }
 
     // Find user first to verify existence
     const user = await userModel.findById(req.user.id);
     console.log('Found user:', user);
 
     if (!user) {
       return res.status(404).json({
         success: false,
         message: "User not found"
       });
     }
 
     // Initialize cartData if it doesn't exist
     if (!user.cartData) {
       user.cartData = {};
     }
 
     // Update cart data
     const cartKey = `cartData.${req.body.itemId}`;
     const updatedUser = await userModel.findByIdAndUpdate(
       req.user.id,
       { $inc: { [cartKey]: 1 } },
       { new: true }
     );
 
     console.log('Updated user:', updatedUser);
 
     res.json({ 
       success: true, 
       message: "Added To Cart",
       cartData: updatedUser.cartData
     });
     
   } catch (error) {
     console.error('Add to cart error:', error);
     res.status(500).json({ 
       success: false, 
       message: "Error adding to cart",
       error: error.message 
     });
   }
 };

 const removeFromCart = async (req, res) => {
   try {
     if (!req.body.itemId) {
       return res.status(400).json({ 
         success: false, 
         message: "Item ID is required" 
       });
     }
 
     // Find and update user in one operation
     const updatedUser = await userModel.findByIdAndUpdate(
       req.user.id,
       {
         $inc: { [`cartData.${req.body.itemId}`]: -1 }
       },
       { new: true }
     );
 
     if (!updatedUser) {
       return res.status(404).json({
         success: false,
         message: "User not found"
       });
     }
 
     // Remove item completely if quantity is 0 or less
     if (updatedUser.cartData[req.body.itemId] <= 0) {
       await userModel.findByIdAndUpdate(
         req.user.id,
         { $unset: { [`cartData.${req.body.itemId}`]: "" } },
         { new: true }
       );
     }
 
     res.json({ 
       success: true, 
       message: "Removed From Cart",
       cartData: updatedUser.cartData
     });
   } catch (error) {
     console.error('Remove from cart error:', error);
     res.status(500).json({ 
       success: false, 
       message: "Error removing from cart",
       error: error.message 
     });
   }
 };
 

const getCart = async (req, res) => {
   try {
      let userData = await userModel.findById(req.user.id);
      let cartData = userData.cartData;
      res.json({ success: true, cartData });
   } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Error fetching cart" })
   }
}

const getCartCount = async (req, res) => {
   try {
      let userData = await userModel.findById(req.user.id);
      let cartData = userData.cartData;
      const count = Object.values(cartData).reduce((total, quantity) => total + quantity, 0);
      res.json({ success: true, count });
   } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Failed to get cart count" })
   }
}

export { addToCart, removeFromCart, getCart, getCartCount }