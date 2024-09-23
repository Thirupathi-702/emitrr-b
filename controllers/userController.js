const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    //check that is there a same username exits
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck) {
      return res.json({ message: "Username is already used" });
    }
    //check that is there a same email exists
    const emailCheck = await User.findOne({ email });
    if (emailCheck) {
      return res.json({ message: "Email is already registered!" });
    }

    //Encryption of password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    const userDetails = {
      username,
      email,
      userId: user._id,
    };

    const secretKey = "Thiru";
    const payload = {
      username,
      email,
      userId: user._id,
    };
    const jwtToken = jwt.sign(payload, secretKey);

    return res.status(201).json({ jwtToken, userDetails });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //authentication for user
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Email is not registered!" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Incorrect Password!" });

    const userDetails = {
      username: user.username,
      email,
      userId: user._id,
    };

    const secretKey = "Thiru";
    const payload = {
      username: user.username,
      email,
      userId: user._id,
    };
    const jwtToken = jwt.sign(payload, secretKey);

    return res.status(200).json({ jwtToken, userDetails });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
