const mongoose = require('mongoose');
const validator = require('validator');
const baseUserModel = require('./userBaseModel');
const cryptPassword = require('../utils/cryptPass');
const extendSchema = require('mongoose-extend-schema');
const authoritySchema = extendSchema(baseUserModel.schema, {
  role: {
    type: String,
    default: 'distributor',
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [8, 'Pin should be minimum 8 digits long'],

    select: false,
  },
  email: {
    type: String,
    required: [true, 'Please Enter Your Email'],
    maxlength: [30, 'Email cannot exceed 30 letters'],
    unique: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
});
Object.assign(authoritySchema.methods, baseUserModel.schema.methods);

authoritySchema.pre('save', cryptPassword);

module.exports = mongoose.model('authority', authoritySchema);
