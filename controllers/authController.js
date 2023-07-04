const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const BusOwner = require('../models/authorityModel');
const sendToken = require('../utils/jwtToken');
const { generateOtp, sendOtp } = require('../utils/sendSms');
const SuperUser = require('../models/distributorModel');
const logger = require('../logger/index');
const User = require('../models/userBaseModel');

//login module for bus owner
exports.loginUser = catchAsyncErrors(async (req, res, next, userType) => {
  //checking if user has given password and phone both
  const profiler = logger.startTimer();

  const { email, phone, password } = req.body;
  if (!email && !phone) {
    return next(new ErrorHandler('Invalid login information', 400));
  }

  let user = phone
    ? await User.findOne({
        phone,
      }).select('+password')
    : await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorHandler('Invalid login information', 401));
  }
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    logger.log(
      'warning',
      `Invalid password given for ${
        phone ? 'phone number : ' + phone : 'email : ' + email
      }`
    );
    return next(new ErrorHandler('Invalid login information', 401));
  }
  const otp = generateOtp();
  const update = {
    otp: otp,
    otpExpire: Date.now() + 5 * 60000,
  };

  user = phone
    ? await User.findOneAndUpdate({ phone }, update, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }).select('id otp phone name role')
    : await User.findOneAndUpdate({ email }, update, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }).select('id otp phone name role'); //sending otp for testing purposes
  //console.log(jk.otp);
  profiler.done({
    message: `User ${user.name} (${user.phone}) requested login otp`,
  });
  // sendOtp(user.phone, otp);
  sendToken(user, 200, res);
});

//verify OTP for everyone
exports.verifyOtp = catchAsyncErrors(async (req, res, next) => {
  const profiler = logger.startTimer();
  if (!req.user) {
    return next(new ErrorHandler('Unauthorized request'));
  }
  const id = req.user.id;
  const user = await User.findOne({
    _id: id,
    otpExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler('Otp is invalid or has expired', 400));
  }
  if (req.body.otp !== user.otp) {
    profiler.done({
      message: `Invalid otp tried for ${user.name} (${user.phone}) !`,
      level: 'warning',
    });
    return next(new ErrorHandler('Otp is invalid or has expired', 400));
  }

  user.otp = undefined;
  user.otpExpire = undefined;
  user.loggedIn = true;
  await user.save({ validateBeforeSave: false });

  sendToken(user, 200, res);
  profiler.done({
    message: `User ${user.name} (${user.phone}) logged in!`,
  });
});

//Register a busOwner

exports.registerAuthority = catchAsyncErrors(async (req, res, next) => {
  const { name, phone, password, email } = req.body;

  const user = await User.create({
    name,
    phone,
    email,
    password,
    role: 'authority',
  });

  logger.warning(` ${user.name} : ${user.phone} (${user._id}) registered!`);
  res.redirect(307, '/api/v1/auth/authority/login');
  // sendToken(user, 201, res);
});
exports.logout = catchAsyncErrors(async (req, res, next) => {
  const profiler = logger.startTimer();
  const user = req.user;
  const id = user.id;
  if (user) {
    user.loggedIn = false;
    user.save({ validateBeforeSave: false });
  }

  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logged out',
  });
  profiler.done({
    message: 'Logged Out',
    level: 'info',
    actionBy: id,
  });
});
