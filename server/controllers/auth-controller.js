const User = require("../../database/models/register-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//register controller
const register = async (req, res) => {
  try {
    const { username, email, password, role, location } = req.body;

    const checkExistingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (checkExistingUser) {
      return res.status(400).json({
        success: false,
        message:
          "user is already exists, try with a differnet username or email.",
      });
    }

    //hash user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create a new user and save it in database
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "retailerokay ",
    });

    await newUser.save();

    if (role === "retailer") {
      await Retailer.create({
        name: username,
        location: location || "Unknown",
        salesData: [],
        userId: newUser._id,
      });
    }

    if (newUser) {
      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Unable to register user",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

//login controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    //check if user exists
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exists",
      });
    }

    //check if password is correct
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    //create user token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "15m",
      }
    );

    res.status(200).json({
      success: true,
      message: `Logged in successfully as ${user.username}`,
      accessToken,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { login, register };
