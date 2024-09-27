const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_Secret = process.env.JWT_SECRET;

//ROUTE-1: Create a User using: POST "/api/auth/createUser". No login required.
router.post(
  "/createuser",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Name must be minimum of 3 characters").isLength({ min: 3 }),
    body("password", "Password must be minimum of 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    //If there are errors, return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      //check whether the user with this email exists already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry, user with this email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const secretPass = await bcrypt.hash(req.body.password, salt);
      //Creates a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secretPass,
      });

      const data = {
        user: { id: user.id },
      };
      const authToken = jwt.sign(data, JWT_Secret);

      res.status(200).json({ msg: "User created succesfully", authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE-2: Authenticate a User using: POST "/api/auth/login". No login required.
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    //If there are errors, return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      //check whether the user typed in correct credentails/ if it even exists
      let user = await User.findOne({ email });
      if (!user)
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare)
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      const data = {
        user: { id: user.id },
      };
      const authToken = jwt.sign(data, JWT_Secret);

      //Responses with user's auth token
      res.status(200).json({ msg: "Welcome Back!", authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE-3: Get logged in user details using: POST "/api/auth/getUser". Login required.
router.post("/getUser", fetchuser, async (req, res) => {
  try {
    let userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.status(200).json({ user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
