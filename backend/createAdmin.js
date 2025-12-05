import mongoose from 'mongoose';
import User from './src/models/User.js';
import Business from './src/models/Business.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@oja247.com" });
    if (existingAdmin) {
      console.log('❌ Admin already exists!');
      console.log('Email: admin@oja247.com');
      process.exit(0);
    }

    // Create a dummy business for admin
    const adminBusiness = new Business({
      name: "OJA247 Admin",
      category: "Admin",
      location: "Headquarters",
      contact: "admin@oja247.com",
      description: "System Administrator Account"
    });
    await adminBusiness.save();
    console.log('✅ Admin business created');

    // Create admin user
    const admin = new User({
      email: "admin@oja247.com",
      password: "Admin123!@#", // Change this to something secure!
      businessId: adminBusiness._id,
      role: "admin"
    });
    await admin.save();

    console.log('\n🎉 Admin account created successfully!');
    console.log('================================');
    console.log('Email: admin@oja247.com');
    console.log('Password: Admin123!@#');
    console.log('================================');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('\n🔐 You can now login at: http://localhost:5173/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();