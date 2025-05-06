const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const signupSchema = new mongoose.Schema({
  fname: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['director', 'manager', 'salesAgent'],
    trim: true
  },
  branch: { 
    type: String, 
    required: [true, 'Branch is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

signupSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  errorMessages: {
    UserExistsError: 'A user with the given email is already registered'
  }
});

const Signup = mongoose.model("Signup", signupSchema);

module.exports = Signup;

