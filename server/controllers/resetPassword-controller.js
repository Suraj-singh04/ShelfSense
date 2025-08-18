const User = require("../../database/models/register-model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

module.exports = resetPassword;
