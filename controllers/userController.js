import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

//create token
const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET);
}

//login user
const loginUser = async (req,res) => {
    const {email, password} = req.body;
    try{
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message: "User does not exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.json({success:false,message: "Invalid credentials"})
        }

        const token = createToken(user._id)
        res.json({
            success: true,
            message: "User registered",
            token:token, // Include token here
            
          });
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//register user
const registerUser = async (req,res) => {
    const {name, email, password} = req.body;
    try{
        //check if user already exists
        const exists = await userModel.findOne({email})
        if(exists){
            return res.json({success:false,message: "User already exists"})
        }

        // validating email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message: "Please enter a valid email"})
        }
        if(password.length<8){
            return res.json({success:false,message: "Please enter a strong password"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({name, email, password: hashedPassword})
        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token})
        console.log("success");

    } catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}
export const saveAddress = async (req, res) => {
    try {
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user.id,
            { $set: { savedAddress: req.body } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Address saved successfully",
            address: updatedUser.savedAddress
        });
    } catch (error) {
        console.error('Save address error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to save address"
        });
    }
};
export const getSavedAddress = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            address: user.savedAddress || null
        });
    } catch (error) {
        console.error('Get address error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch saved address"
        });
    }
};


export {loginUser, registerUser}