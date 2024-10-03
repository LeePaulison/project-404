const express = require("express");
const { getUserById } = require("../controllers/userController");
const { verifyJWT } = require("../middleware/jwtMiddleware");

const router = express.Router();

router.get("/:id", verifyJWT, getUserById);

module.exports = router;
