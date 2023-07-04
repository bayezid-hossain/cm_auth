const mongoose = require('mongoose');
const validator = require('validator');
const baseUserModel = require('./userBaseModel');
const cryptPassword = require('../utils/cryptPass');
const extendSchema = require('mongoose-extend-schema');

const distributorSchema = extendSchema(
  baseUserModel.schema,
  {
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minlength: [8, 'Password should be minimum 8 characters long'],

      select: false,
    },
  },
  { collection: 'superuser' }
);
Object.assign(distributorSchema.methods, baseUserModel.schema.methods);

distributorSchema.pre('save', cryptPassword);

module.exports = mongoose.model('distributor', distributorSchema);
