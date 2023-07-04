const bcrypt = require('bcryptjs');
const cryptPassword = async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
};

module.exports = cryptPassword;
