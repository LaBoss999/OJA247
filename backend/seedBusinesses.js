import mongoose from "mongoose";
import dotenv from "dotenv";
import Business from "./src/models/Business.js";

dotenv.config();

const sampleBusinesses = [
  {
    name: "Mama Chinedu Kitchen",
    description: "Authentic home-cooked Nigerian dishes served hot every day.",
    category: "Food",
    location: "Surulere, Lagos",
    contact: "+234 809 123 4567",
    images: [
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2"
    ],
    logo: "https://images.unsplash.com/photo-1503602642458-232111445657",
    banner: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    themeColor: "#D35400",
    socialLinks: {
      facebook: "https://facebook.com/mamachinedu",
      instagram: "https://instagram.com/mamachinedukitchen",
      twitter: "",
      website: ""
    },
    products: [
      {
        name: "Jollof Rice + Turkey",
        description: "Smoky party-style jollof with fried turkey.",
        price: 3500,
        image: "https://images.unsplash.com/photo-1604909053175-bf5524e78f20"
      },
      {
        name: "Efo Riro",
        description: "Rich Yoruba vegetable soup with assorted meat.",
        price: 2500,
        image: "https://images.unsplash.com/photo-1553621042-f6e147245754"
      }
    ],
    highlights: ["Fast Delivery", "Affordable Meals", "Fresh Ingredients"]
  },

  {
    name: "SwiftFix Phone Repairs",
    description: "Professional phone repair and gadget maintenance.",
    category: "Tech",
    location: "Ikeja, Lagos",
    contact: "+234 701 444 8899",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c"
    ],
    logo: "https://images.unsplash.com/photo-1581092334641-2531c0b9c8e8",
    banner: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    themeColor: "#1A73E8",
    socialLinks: {
      facebook: "",
      instagram: "https://instagram.com/swiftfix",
      twitter: "https://twitter.com/swiftfix",
      website: "https://swiftfix.ng"
    },
    products: [
      {
        name: "iPhone Screen Replacement",
        description: "Original quality display replacement.",
        price: 45000,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
      },
      {
        name: "Battery Replacement",
        description: "Fast battery swaps for all devices.",
        price: 15000,
        image: "https://images.unsplash.com/photo-1516280030429-27679b3dc9cf"
      }
    ],
    highlights: ["Same-Day Repairs", "Warranty Guaranteed", "Certified Technicians"]
  },

  {
    name: "Glow Beauty Store",
    description: "Your one-stop shop for skincare, cosmetics & fragrances.",
    category: "Beauty",
    location: "Lekki Phase 1, Lagos",
    contact: "+234 808 882 1100",
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
      "https://images.unsplash.com/photo-1526045478516-99145907023c"
    ],
    logo: "https://images.unsplash.com/photo-1522336572468-97b06e8ef143",
    banner: "https://images.unsplash.com/photo-1526045612212-70caf35c14df",
    themeColor: "#E91E63",
    socialLinks: {
      facebook: "https://facebook.com/glowstore",
      instagram: "https://instagram.com/glowbeautystore",
      twitter: "",
      website: "https://glowbeauty.ng"
    },
    products: [
      {
        name: "Vitamin C Serum",
        description: "Brightening + anti-aging blend.",
        price: 8000,
        image: "https://images.unsplash.com/photo-1596300092616-e304ea0b9c8c"
      },
      {
        name: "Matte Lipstick",
        description: "Long-lasting and highly pigmented.",
        price: 4500,
        image: "https://images.unsplash.com/photo-1583259033935-0c18e7ce95b2"
      }
    ],
    highlights: ["Premium Brands", "Nationwide Delivery", "Great Customer Service"]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Business.deleteMany();
    console.log("Old businesses cleared");

    const created = await Business.insertMany(sampleBusinesses);
    console.log(`Inserted ${created.length} sample businesses`);

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
}

seed();
