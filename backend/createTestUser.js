const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: "admin@test.com" });
    if (existingUser) {
      console.log("Test user already exists!");
      mongoose.connection.close();
      return;
    }
    
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const testUser = new User({
      name: "Test Admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: "Admin"
    });
    
    await testUser.save();
    console.log("Test user created successfully!");
    console.log("Email: admin@test.com");
    console.log("Password: password123");
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}

createTestUser(); 