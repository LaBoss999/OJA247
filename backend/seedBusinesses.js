// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import Business from "./src/models/Business.js";

// dotenv.config();

// const sampleBusinesses = [
//   {
//     name: "Mama Chinedu Kitchen",
//     description: "Authentic home-cooked Nigerian dishes served hot every day.",
//     category: "Food",
//     location: "Surulere, Lagos",
//     contact: "+234 809 123 4567",
//     images: [
//       "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
//       "https://images.unsplash.com/photo-1551218808-94e220e084d2"
//     ],
//     logo: "https://images.unsplash.com/photo-1503602642458-232111445657",
//     banner: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
//     themeColor: "#D35400",
//     socialLinks: {
//       facebook: "https://facebook.com/mamachinedu",
//       instagram: "https://instagram.com/mamachinedukitchen",
//       twitter: "",
//       website: ""
//     },
//     highlights: ["Fast Delivery", "Affordable Meals", "Fresh Ingredients"]
//   },

//   {
//     name: "SwiftFix Phone Repairs",
//     description: "Professional phone repair and gadget maintenance.",
//     category: "Tech",
//     location: "Ikeja, Lagos",
//     contact: "+234 701 444 8899",
//     images: [
//       "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
//       "https://images.unsplash.com/photo-1519389950473-47ba0277781c"
//     ],
//     logo: "https://images.unsplash.com/photo-1581092334641-2531c0b9c8e8",
//     banner: "https://images.unsplash.com/photo-1518770660439-4636190af475",
//     themeColor: "#1A73E8",
//     socialLinks: {
//       facebook: "",
//       instagram: "https://instagram.com/swiftfix",
//       twitter: "https://twitter.com/swiftfix",
//       website: "https://swiftfix.ng"
//     },
//     highlights: ["Same-Day Repairs", "Warranty Guaranteed", "Certified Technicians"]
//   },

//   {
//     name: "Glow Beauty Store",
//     description: "Your one-stop shop for skincare, cosmetics & fragrances.",
//     category: "Beauty",
//     location: "Lekki Phase 1, Lagos",
//     contact: "+234 808 882 1100",
//     images: [
//       "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
//       "https://images.unsplash.com/photo-1526045478516-99145907023c"
//     ],
//     logo: "https://images.unsplash.com/photo-1522336572468-97b06e8ef143",
//     banner: "https://images.unsplash.com/photo-1526045612212-70caf35c14df",
//     themeColor: "#E91E63",
//     socialLinks: {
//       facebook: "https://facebook.com/glowstore",
//       instagram: "https://instagram.com/glowbeautystore",
//       twitter: "",
//       website: "https://glowbeauty.ng"
//     },
//     highlights: ["Premium Brands", "Nationwide Delivery", "Great Customer Service"]
//   },
//   {
//   name: "GlamourTouch Beauty Studio",
//   description: "Premium makeup, skincare, and beauty enhancement services.",
//   category: "Beauty",
//   location: "Lekki Phase 1, Lagos",
//   contact: "+234 803 552 1199",
//   images: [
//     "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
//     "https://images.unsplash.com/photo-1522337660859-02fbefca4702"
//   ],
//   logo: "https://images.unsplash.com/photo-1522336572468-97b06e8ef5a0",
//   banner: "https://images.unsplash.com/photo-1532712938310-34cb3982ef6b",
//   themeColor: "#E91E63",
//   socialLinks: {
//     facebook: "https://facebook.com/glamourtouch",
//     instagram: "https://instagram.com/glamourtouch",
//     twitter: "",
//     website: "https://glamourtouch.ng"
//   },
//   highlights: ["Certified Makeup Artists", "Premium Beauty Products", "Flexible Home Service"]
// },
// {
//   name: "TasteBuds Continental Kitchen",
//   description: "Delicious meals with a fusion of African and continental flavors.",
//   category: "Food",
//   location: "Surulere, Lagos",
//   contact: "+234 806 778 2211",
//   images: [
//     "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
//     "https://images.unsplash.com/photo-1504674900247-083bdf9bb836"
//   ],
//   logo: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
//   banner: "https://images.unsplash.com/photo-1504674900247-e5807ddcbdc5",
//   themeColor: "#FF5722",
//   socialLinks: {
//     facebook: "https://facebook.com/tastebuds",
//     instagram: "https://instagram.com/tastebuds",
//     twitter: "https://twitter.com/tastebuds",
//     website: ""
//   },
//   highlights: ["Fast Delivery", "Fresh Ingredients", "Affordable Prices"]
// },
// {
//   name: "FitNation Gym & Wellness",
//   description: "Modern fitness center offering workouts, yoga, and personal training.",
//   category: "Fitness",
//   location: "Gbagada, Lagos",
//   contact: "+234 909 334 8877",
//   images: [
//     "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
//     "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"
//   ],
//   logo: "https://images.unsplash.com/photo-1584467735858-3b3de3fddfa3",
//   banner: "https://images.unsplash.com/photo-1558611848-56cb1b38183a",
//   themeColor: "#4CAF50",
//   socialLinks: {
//     facebook: "",
//     instagram: "https://instagram.com/fitnation",
//     twitter: "https://twitter.com/fitnation",
//     website: "https://fitnation.ng"
//   },
//   highlights: ["24/7 Access", "Certified Trainers", "Wide Range of Equipment"]
// },
// {
//   name: "UrbanStyle Fashion Hub",
//   description: "Trendy clothing store offering modern outfits for men and women.",
//   category: "Fashion",
//   location: "Yaba, Lagos",
//   contact: "+234 812 339 9022",
//   images: [
//     "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47",
//     "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c"
//   ],
//   logo: "https://images.unsplash.com/photo-1514996937319-344454492b37",
//   banner: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb",
//   themeColor: "#9C27B0",
//   socialLinks: {
//     facebook: "https://facebook.com/urbanstyle",
//     instagram: "https://instagram.com/urbanstyle",
//     twitter: "",
//     website: "https://urbanstyle.ng"
//   },
//   highlights: ["Affordable Prices", "Exclusive Designs", "Fast Delivery"]
// },
// {
//   name: "GreenLeaf Organic Store",
//   description: "Healthy organic foods, groceries, and supplements.",
//   category: "Groceries",
//   location: "Magodo, Lagos",
//   contact: "+234 802 556 7711",
//   images: [
//     "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd",
//     "https://images.unsplash.com/photo-1524594081293-190a2fe0b7c6"
//   ],
//   logo: "https://images.unsplash.com/photo-1506611361891-2f18ae6c8f52",
//   banner: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2",
//   themeColor: "#8BC34A",
//   socialLinks: {
//     facebook: "",
//     instagram: "https://instagram.com/greenleaf",
//     twitter: "https://twitter.com/greenleaf",
//     website: "https://greenleaf.ng"
//   },
//   highlights: ["Fresh Organic Products", "Affordable Healthy Options", "Eco-Friendly Packaging"]
// },
// {
//   name: "TechSavvy Electronics",
//   description: "Latest gadgets, accessories, and tech solutions.",
//   category: "Tech",
//   location: "Ikeja, Lagos",
//   contact: "+234 807 445 3322",
//   images: [
//     "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
//     "https://images.unsplash.com/photo-1519389950473-47ba0277781c"
//   ],
//   logo: "https://images.unsplash.com/photo-1581092334641-2531c0b9c8e8",
//   banner: "https://images.unsplash.com/photo-1518770660439-4636190af475",
//   themeColor: "#2196F3",
//   socialLinks: {
//     facebook: "https://facebook.com/techsavvy",
//     instagram: "https://instagram.com/techsavvy",
//     twitter: "https://twitter.com/techsavvy",
//     website: "https://techsavvy.ng"
//   },
//   highlights: ["Cutting-edge Technology", "Affordable Prices", "Excellent Customer Support"]        
  
// }

// ];

// async function seed() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("MongoDB connected");

//     const created = await Business.insertMany(sampleBusinesses);
//     console.log(`Inserted ${created.length} sample businesses`);

//     mongoose.disconnect();
//   } catch (err) {
//     console.error(err);
//     mongoose.disconnect();
//   }
// }

// seed();
