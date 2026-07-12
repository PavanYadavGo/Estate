import Form from '../models/formModel.js';

export const submitForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body; // Debugging log

    const newForm = new Form({
      name,
      email,
      phone,
      message,
    });

    const savedForm = await newForm.save();
    

    res.json({ message: 'Form submitted successfully' });
  } catch (error) {
  console.error("========== FORM ERROR ==========");
  console.error(error);
  console.error(error.message);
  console.error(error.stack);

  res.status(500).json({
    success: false,
    message: error.message,
  });
}
};