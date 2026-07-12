import Form from '../models/formModel.js';
import emailService from '../services/emailService.js';

export const submitForm = async (req, res) => {
  try {

    const { name, email, phone, message } = req.body;

    const newForm = new Form({
      name,
      email,
      phone,
      message,
    });

    await newForm.save();

    await emailService.sendEmailSafely(
      process.env.ADMIN_EMAIL,
      `New Contact Form - ${name}`,
      `
      <h2>New Contact Form Submission</h2>

      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      `
    );

    await emailService.sendEmailSafely(
      email,
      "We've received your enquiry - BuildEstate",
      `
      <h2>Thank you for contacting BuildEstate</h2>

      <p>Hello ${name},</p>

      <p>Your enquiry has been received successfully.</p>

      <p>Our team will get back to you shortly.</p>

      <br>

      <p>Regards,<br>BuildEstate Team</p>
      `
    );

    res.json({
      success: true,
      message: "Form submitted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Server Error"
    });

  }
};