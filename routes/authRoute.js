const express = require('express');
const {
  login,
  verifyOtp,
  logout,
  loginUser,
  registerAuthority,
} = require('../controllers/authController');
const {
  authorizeRoles,
  approvalStatus,

  isLoggedInUser,
  isAuthenticatedUser,
  setUserType,
} = require('../middleware/auth');

const router = express.Router();

router
  .route('/api/v1/auth/authority/login')
  .post(setUserType('authority'), loginUser);
router
  .route('/api/v1/auth/distributor/login')
  .post(setUserType('distributor'), loginUser);

router.route('/api/v1/auth/authority/register').post(registerAuthority);
router.route('/api/v1/auth/admin/login').post(setUserType('admin'), loginUser);
router.route('/api/v1/auth/verify').post(isAuthenticatedUser, verifyOtp);
router.route('/api/v1/auth/logout').get(isLoggedInUser, logout);
module.exports = router;
