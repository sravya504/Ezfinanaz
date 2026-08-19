const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./src/models/User");

const resetPassword = async () => {
  try {
    console.log("Mongo URI exists:", !!process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI);

    const newPassword = "Admin@123";

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await User.findOneAndUpdate(
      { email: "testuser@gmail.com" },
      {
        password: hashedPassword,
        role: "admin",
      },
      { new: true }
    );

    if (!user) {
      console.log("Admin user not found");
      return;
    }

    console.log("Admin password reset successfully");
    console.log("Email:", user.email);
    console.log("Password:", newPassword);
    console.log("Role:", user.role);

  } catch (error) {
    console.error("Reset password error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

resetPassword();