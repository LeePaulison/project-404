const express = require("express");
const passport = require("passport");
const { githubLogin, githubCallback, linkAccount, logout } = require("../controllers/authController");

const router = express.Router();

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.post("/link_account", linkAccount);
router.get("/logout", logout);

module.exports = router;
