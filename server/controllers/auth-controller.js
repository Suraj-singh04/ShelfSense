const User = require("../../database/models/register-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//register controller
const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role = "retailer",
      address,
      name,
      mobileNumber,
    } = req.body;

    // Check if user already exists
    const checkExistingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (checkExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists, try with a different username or email.",
      });
    }

    // Validate required fields
    if (
      !username ||
      !email ||
      !password ||
      !mobileNumber ||
      (role === "retailer" && !address)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Username, email, password, mobile number and address are required.",
      });
    }

    // Hash user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      name: name || username,
      mobileNumber,
      address: role === "retailer" ? address : undefined,
    });

    await newUser.save();

    // If retailer, create a Retailer profile
    if (role === "retailer") {
      const Retailer = require("../../database/models/retailer-model");
      await Retailer.create({
        name: name || username,
        email,
        address,
        salesData: [],
        mobileNumber,
        userId: newUser._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

//login controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist",
      });
    }

    // Check if password is correct
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create user token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      success: true,
      message: `Logged in successfully as ${user.username}`,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      userId: user._id,
      role: user.role,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is not correct! Please try again.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = newHashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changes successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = { login, register, changePassword };
