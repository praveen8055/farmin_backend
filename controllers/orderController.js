import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

//config variables
const currency = "inr";
const deliveryCharge = 5;
const frontend_URL = 'http://localhost:3004';
const sendMessage=async(newOrder,OrderType)=>{
    const {email,street,city,zipcode,phone}=newOrder.address;
     const item=newOrder.items;
    //  item.forEach(({  name, price,quantity }) => {
       
    //   });
     
      const transformedItems = item.map(({  name, price, quantity }) => ({
        name,
        price,
        quantity
      }));
    
      const body = {
        email: email,
        street: street,
        city: city,
        zipcode: zipcode,
        phone: phone,
      };
      const bodyText = Object.entries(body)
  .map(([key, value]) => `${key}: ${value}`)
  .join(', ');
      
      // Create a message for each transformed item
      const itemMessages = transformedItems.map(({ name, price, quantity }) => {
        return `Order placed: Item - ${name}, Quantity - ${quantity}, Price - ${price}`;
      });
      
      // Join all item messages into a single string
      const itemsMessage = itemMessages.join('. ');
      
      // Combine `body` and `itemsMessage` into the final message
      const messageBody = bodyText+ '. ' + itemsMessage+"Ordertype:"+OrderType;
      
      console.log(messageBody);
   

    const message = await client.messages.create({
        body: messageBody,
        from: '+12317870543',
        to: process.env.PHONE_NUMBER,
       
    })

    console.log(message)
}

// Placing User Order for Frontend using stripe
const placeOrder = async (req, res) => {

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charge"
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
            line_items: line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url,message: "Order Placed",sendMessage });
       const OrderType="online";
        sendMessage(newOrder,OrderType);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Placing User Order for Frontend using stripe
const placeOrderCod = async (req, res) => {

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: true,
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed" ,sendMessage});
        const OrderType="COD";
       sendMessage(newOrder,OrderType);
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Listing Order for Admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const updateStatus = async (req, res) => {
    console.log(req.body);
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        res.json({ success: false, message: "Error" })
    }

}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" })
        }
        else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false, message: "Not Paid" })
        }
    } catch (error) {
        res.json({ success: false, message: "Not  Verified" })
    }

}

export { placeOrder, listOrders, userOrders, updateStatus, verifyOrder, placeOrderCod }