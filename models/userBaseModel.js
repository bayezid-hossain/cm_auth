const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cryptPassword = require('../utils/cryptPass');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter Your Name'],
    maxlength: [30, 'Name cannot exceed 30 characters'],
    minlength: [4, 'Name should have more than 4 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Please Enter Your Phone'],
    maxlength: [
      11,
      'Phone Number cannot exceed 11 digits, exclude +88 if provided',
    ],
    minlength: [11, 'Phone number cannot be less than 11 digits'],
    unique: true,
    validate: {
      validator: function (arr) {
        return !isNaN(arr);
      },
      message: 'Please Enter a valid Phone Number',
    },
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [8, 'Password should be minimum 8 characters long'],

    select: false,
  },
  email: {
    type: String,
    required: [true, 'Please Enter Your Email'],
    maxlength: [30, 'Email cannot exceed 30 letters'],
    unique: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  role: {
    type: String,
    default: 'distributor',
  },
  otp: String,
  otpExpire: Date,
  loggedIn: false,
  approvalStatus: {
    type: String,
    default: 'pending',
  },
});

UserSchema.pre('save', cryptPassword);

//JWT Token

UserSchema.methods.getJWTToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_Expire,
    }
  );
};

//Compare Password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('user', UserSchema);
