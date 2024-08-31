import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";

// Handle user signup
const handleUserSignUp = async (req, res) => {
  try {
    const { role, aadharCardNumber, ...userData } = req.body;

    // Check if an admin already exists
    if (role === "admin" && (await User.findOne({ role: "admin" }))) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    // Validate Aadhar Card Number
    if (!/^\d{12}$/.test(aadharCardNumber)) {
      return res
        .status(400)
        .json({ error: "Aadhar Card Number must be exactly 12 digits" });
    }

    // Check if a user with the same Aadhar card already exists
    if (await User.findOne({ aadharCardNumber })) {
      return res
        .status(400)
        .json({ error: "User with the same Aadhar card already exists" });
    }

    // Create and save the new user
    const newUser = new User({ ...userData, role, aadharCardNumber });
    const savedUser = await newUser.save();

    console.log("User data saved successfully");

    // Generate and set authentication token as a cookie
    const payload = { id: savedUser.id };
    const token = generateToken(payload);
    res.cookie("token", token, {
      httpOnly: true, // Prevent client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({ user: savedUser });
  } catch (err) {
    console.error("User signup failed:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle user login
const handleUserLogin = async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;

    // Ensure both Aadhar Card Number and password are provided
    if (!aadharCardNumber || !password) {
      return res
        .status(400)
        .json({ error: "Aadhar Card Number and password are required" });
    }

    // Find user by Aadhar Card Number
    const user = await User.findOne({ aadharCardNumber });

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ error: "Invalid Aadhar Card Number or Password" });
    }

    // Generate and set authentication token as a cookie
    const payload = { id: user.id };
    const token = generateToken(payload);
    res.cookie("token", token, {
      httpOnly: true, // Prevent client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("User login failed:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle request to get user information
const handleGetUserInformation = async (req, res) => {
  try {
    // Retrieve user information from the request object
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
  } catch (err) {
    console.error("Failed to retrieve user information:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle request to change user password
const handleChangeUserPassword = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from request object
    const { currentPassword, newPassword } = req.body; // Extract current and new passwords

    // Ensure both currentPassword and newPassword are provided
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both currentPassword and newPassword are required" });
    }

    // Find the user and verify the current password
    const user = await User.findById(userId);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    console.log("Password updated successfully");
    res.status(200).json({ message: "Password updated" });
  } catch (err) {
    console.error("Failed to update password:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  handleUserSignUp,
  handleUserLogin,
  handleGetUserInformation,
  handleChangeUserPassword,
};
