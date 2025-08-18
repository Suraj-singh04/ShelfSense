const crypto = require("crypto");
const User = require("../../database/models/register-model");

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "No user found with that email" });
  }

  const expiry = Date.now() + 1000 * 60 * 15;
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = expiry;

  await user.save({ validateModifiedOnly: true });

  const resetLink = `http://localhost:5173/reset-password/${token}`;

  // Simulate sending email (log to console for now)
  console.log(`Reset link (email this): ${resetLink}`);

  return res.status(200).json({
    success: true,
    message: "Password reset link sent (check your email)",
  });
};

module.exports = requestPasswordReset;
