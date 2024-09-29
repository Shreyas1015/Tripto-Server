const express = require("express");
const {
  login,
  signUp,
  //   sendPhoneVerification,
  sendEmailVerification,
  confirmEmail,
  sendLoginEmailVerification,
  refresh,
  logout,
} = require("../controllers/authController");
const router = express.Router();

router.post("/login", login);
router.post("/signup_with_verification", signUp);
// router.post("/sendPhoneVerification", sendPhoneVerification);
router.post("/sendEmailVerification", sendEmailVerification);
router.post("/sendLoginEmailVerification", sendLoginEmailVerification);
router.post("/confirmEmail", confirmEmail);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
