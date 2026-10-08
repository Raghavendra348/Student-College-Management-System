const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT Token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      collegeName: user.collegeName,
    },
    process.env.JWT_SECRET || "student_college_management_secret",
    {
      expiresIn: "1d",
    }
  );
};

// ==========================================
// REGISTER COLLEGE ACCOUNT
// ==========================================
const register = async (req, res) => {
  try {
    const { collegeName, email, principalName, contactNumber, password, confirmPassword } =
      req.body;

    if (!collegeName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "College name, college email, and password are required",
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This college email is already registered",
      });
    }

    // Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      collegeName: collegeName.trim(),
      email: cleanEmail,
      principalName: principalName ? principalName.trim() : "",
      contactNumber: contactNumber ? contactNumber.trim() : "",
      password: hashedPassword,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "College registered successfully",
      user: {
        id: user._id,
        collegeName: user.collegeName,
        email: user.email,
        principalName: user.principalName,
        contactNumber: user.contactNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while registering college",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid college email or password",
      });
    }

    // Compare with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid college email or password",
      });
    }

    const token = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        collegeName: user.collegeName,
        email: user.email,
        principalName: user.principalName,
        contactNumber: user.contactNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while logging in",
    });
  }
};

// ==========================================
// FORGOT PASSWORD
// ==========================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered college email",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No college account found with this email address",
      });
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token expires in 1 hour
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Check if email service / SMTP is configured
    const isEmailConfigured = Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER
    );

    let resetUrl = `/reset-password/${resetToken}`;

    return res.status(200).json({
      success: true,
      message: isEmailConfigured
        ? "Password reset link has been sent to your email."
        : "Password reset token generated successfully.",
      resetToken,
      resetUrl,
      emailConfigured: isEmailConfigured,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing forgot password request",
    });
  }
};

// ==========================================
// RESET PASSWORD
// ==========================================
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword, password } = req.body;
    const finalPassword = newPassword || password;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!finalPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (confirmPassword && finalPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (finalPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }

    // Hash new password
    user.password = await bcrypt.hash(finalPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while resetting password",
    });
  }
};

// ==========================================
// GET PROFILE
// ==========================================
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "College account not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        collegeName: user.collegeName,
        email: user.email,
        principalName: user.principalName,
        contactNumber: user.contactNumber,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { collegeName, principalName, contactNumber, address, currentPassword, newPassword } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "College account not found",
      });
    }

    if (collegeName) user.collegeName = collegeName.trim();
    if (principalName !== undefined) user.principalName = principalName.trim();
    if (contactNumber !== undefined) user.contactNumber = contactNumber.trim();
    if (address !== undefined) user.address = address.trim();

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new password",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        collegeName: user.collegeName,
        email: user.email,
        principalName: user.principalName,
        contactNumber: user.contactNumber,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};