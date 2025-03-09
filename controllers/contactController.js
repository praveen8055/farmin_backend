import contactModel from '../models/contactModel.js';
// import { sendMessage } from '../utils/twilio.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate input
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Create new contact entry
    const newContact = new contactModel({
      name,
      email,
      phone,
      message
    });

    await newContact.save();

    // Send notification via Twilio
    const messageBody = `New Contact Form Submission:
Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message}`;

    // await sendMessage(messageBody);

    res.status(201).json({
      success: true,
      message: "Thank you for contacting us. We'll get back to you soon!"
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to submit contact form"
    });
  }
};

export const listContacts = async (req, res) => {
  try {
    const contacts = await contactModel.find({})
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('List contacts error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts"
    });
  }
};
export const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        console.log('Updating message:', { id, status }); // Add logging

        // Validate status
        const validStatuses = ['new', 'read', 'responded'];
        if (!validStatuses.includes(status)) {
            console.log('Invalid status:', status); // Add logging
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            });
        }

        const updatedMessage = await contactModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedMessage) {
            console.log('Message not found:', id); // Add logging
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        console.log('Message updated successfully:', updatedMessage); // Add logging
        res.json({
            success: true,
            message: "Status updated successfully",
            data: updatedMessage
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update status"
        });
    }
};