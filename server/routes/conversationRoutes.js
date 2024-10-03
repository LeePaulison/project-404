const express = require("express");
const { getConversations, createConversation, updateConversation } = require("../controllers/conversationController");
const { verifyJWT } = require("../middleware/jwtMiddleware");

const router = express.Router();

router.get("/", verifyJWT, getConversations);
router.post("/", verifyJWT, createConversation);
router.put("/:id", verifyJWT, updateConversation);

module.exports = router;
