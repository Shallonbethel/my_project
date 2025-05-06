const express = require("express");
const router = express.Router();


// GET Root Route
router.get("/", (req, res) => {
  res.redirect("/index");
});

// GET Home Page
router.get("/index", (req, res) => {
  res.render("index");
});

// POST Contact Form
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const newMessage = new ContactMessage({ name, email, message });
    await newMessage.save();
    res.redirect("/?success=true");
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).send("Error submitting message.");
  }
});

module.exports = router;
