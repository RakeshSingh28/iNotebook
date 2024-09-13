const express = require("express");
const User = require("../models/User");

const router = express.Router();

//Create a User using: POST "/api/auth/". Doesn't require auth.
router.post("/", (req, res) => {
  const user = User(req.body);
  user.save();
  res.json(req.body);
});

module.exports = router;
