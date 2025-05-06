const express = require("express");
const router = express.Router();
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");

router.use(passport.initialize());
router.use(passport.session());

// Import model
const Signup = require("../models/signup");

// Register admin - GET route to render signup page
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Signup", error: null });
});

// Register admin - POST route to handle signup logic
router.post("/signup", async (req, res) => {
  try {
    const { email, password, confirmPassword, fname, role, branch } = req.body;

    // Check for password match
    if (password !== confirmPassword) {
      return res.status(400).render("signup", {
        title: "Signup",
        error: "Passwords do not match!",
      });
    }

    // Check if user already exists
    const existingUser = await Signup.findOne({ email });
    if (existingUser) {
      return res.status(400).render("signup", {
        title: "Signup",
        error: "A user with this email already exists!",
      });
    }

    // Create new user
    const user = new Signup({ email, fname, role, branch });

    // Register user
    Signup.register(user, password, (err) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(400).render("signup", {
          title: "Signup",
          error: "Error registering user. Please try again!",
        });
      }
      res.redirect("/signuplist");
    });
  } catch (err) {
    console.error("Signup user error:", err);
    res
      .status(500)
      .render("signup", {
        title: "Signup",
        error: "An unexpected error occurred",
      });
  }
});

// Login admin page - POST route for handling login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const errorMessage =
        info && info.message ? info.message : "Invalid credentials";
      if (req.xhr) return res.status(401).json({ error: errorMessage });
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      if (req.xhr) {
        return res.json({ role: user.role });
      }

      // Redirect based on user role
      switch (user.role) {
        case "manager":
          return res.redirect("/manager-dashboard");
        case "salesAgent":
          return res.redirect("/salesAgentDashboard");
        case "director":
          return res.redirect("/dashboard");
        default:
          return res.send("User with that role does not exist in the system");
      }
    });
  })(req, res, next);
});

// View all users in the signup list - GET route
router.get(
  "/signuplist",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const signupItems = await Signup.find().sort({ $natural: -1 });
      res.render("signuplist", {
        title: "Signup List",
        users: signupItems,
        user: req.user,
      });
    } catch (error) {
      console.error("Error fetching signup list:", error);
      res.status(404).send("Unable to find items in the database");
    }
  }
);

// Login page GET route
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

module.exports = router;
