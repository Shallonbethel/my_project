// 1. Dependencies
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
require("dotenv").config();

// 2. Models
const Signup = require("./models/signup");

// 3. Route imports (internal form-based routing only)
const directorDashRoutes = require("./Routes/directorDashRoutes");
const salesAgentDashboardRoutes = require("./Routes/salesAgentRoutes");
const managerDashRoutes = require("./routes/managerDashRoutes");
const creditSaleRoutes = require("./Routes/creditSaleFormRoutes");
const salesRoutes = require("./Routes/salesRoutes");
const indexRoutes = require("./Routes/indexRoutes");
const authRoutes = require("./routes/authRoutes");
const miscRoutes = require("./Routes/miscRoutes");
const procurementRoutes = require('./routes/procurementRoutes');

// 4. App setup
const app = express();
const PORT = process.env.PORT || 3001;

// 5. MongoDB connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.DATABASE_LOCAL || 'mongodb://127.0.0.1:27017/kgl', {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log("MongoDB connected successfully");
})
.catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

// Mongo events
mongoose.connection.on('connected', () => console.log('Mongoose connected'));
mongoose.connection.on('error', err => console.error('Mongoose error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));

// 6. View engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 7. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));



app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(flash());

// Set flash message vars globally
app.use((req, res, next) => {
  console.log('User in middleware:', req.user); 
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Passport config
app.use(passport.initialize());
app.use(passport.session());

passport.use(Signup.createStrategy());
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user); // Debug log
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Signup.findById(id);
    console.log('Deserializing user:', user); // Debug log
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// 8. Routes (internal handling, not APIs)
app.use("/", indexRoutes);
app.use("/", procurementRoutes);
app.use("/", managerDashRoutes);
app.use("/", directorDashRoutes);
app.use("/", creditSaleRoutes);
app.use("/sell", salesRoutes);
app.use("/", authRoutes);
app.use("/", miscRoutes);
app.use("/", salesAgentDashboardRoutes);

// 9. Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 10. 404 fallback
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page not found',
    error: {}
  });
});

// 11. Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
