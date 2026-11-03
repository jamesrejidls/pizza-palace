require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedData = [
  // Pizza Bases
  { name: 'Classic Thin Crust', category: 'base', price: 80, stock: 100, description: 'Light and crispy traditional thin base', threshold: 20 },
  { name: 'Thick Pan Crust', category: 'base', price: 100, stock: 80, description: 'Soft and fluffy deep pan style', threshold: 20 },
  { name: 'Stuffed Crust', category: 'base', price: 130, stock: 60, description: 'Cheese-filled golden crust', threshold: 15 },
  { name: 'Whole Wheat Base', category: 'base', price: 110, stock: 70, description: 'Healthy whole grain option', threshold: 15 },
  { name: 'Gluten-Free Base', category: 'base', price: 150, stock: 40, description: 'Perfect for gluten-sensitive customers', threshold: 10 },

  // Sauces
  { name: 'Classic Tomato', category: 'sauce', price: 30, stock: 120, description: 'Traditional Italian tomato sauce', threshold: 20 },
  { name: 'Spicy Arrabbiata', category: 'sauce', price: 35, stock: 90, description: 'Fiery red chili tomato sauce', threshold: 20 },
  { name: 'White Garlic Cream', category: 'sauce', price: 45, stock: 80, description: 'Rich creamy garlic base sauce', threshold: 15 },
  { name: 'BBQ Smoky', category: 'sauce', price: 40, stock: 70, description: 'Tangy smoky barbecue sauce', threshold: 15 },
  { name: 'Pesto Basil', category: 'sauce', price: 50, stock: 60, description: 'Fresh basil and pine nut pesto', threshold: 10 },

  // Cheese
  { name: 'Mozzarella', category: 'cheese', price: 60, stock: 100, description: 'Classic stretchy mozzarella', threshold: 20 },
  { name: 'Cheddar', category: 'cheese', price: 65, stock: 80, description: 'Sharp yellow cheddar', threshold: 15 },
  { name: 'Parmesan', category: 'cheese', price: 80, stock: 60, description: 'Aged Italian parmesan', threshold: 10 },
  { name: 'Four Cheese Blend', category: 'cheese', price: 100, stock: 50, description: 'Mozzarella, cheddar, parmesan & gouda', threshold: 10 },
  { name: 'Vegan Cheese', category: 'cheese', price: 90, stock: 40, description: 'Plant-based cheese alternative', threshold: 8 },

  // Veggies
  { name: 'Bell Peppers', category: 'veggie', price: 20, stock: 150, description: 'Colorful red, yellow & green peppers', threshold: 25 },
  { name: 'Mushrooms', category: 'veggie', price: 25, stock: 120, description: 'Sliced fresh mushrooms', threshold: 20 },
  { name: 'Onions', category: 'veggie', price: 15, stock: 200, description: 'Sweet caramelized onions', threshold: 30 },
  { name: 'Black Olives', category: 'veggie', price: 30, stock: 100, description: 'Sliced Mediterranean olives', threshold: 15 },
  { name: 'Jalapeños', category: 'veggie', price: 25, stock: 80, description: 'Spicy pickled jalapeños', threshold: 15 },
  { name: 'Sweet Corn', category: 'veggie', price: 20, stock: 130, description: 'Golden sweet corn kernels', threshold: 20 },
  { name: 'Spinach', category: 'veggie', price: 20, stock: 90, description: 'Fresh baby spinach leaves', threshold: 15 },
  { name: 'Tomatoes', category: 'veggie', price: 15, stock: 150, description: 'Fresh sliced tomatoes', threshold: 25 },

  // Meats
  { name: 'Pepperoni', category: 'meat', price: 80, stock: 100, description: 'Classic spiced pepperoni slices', threshold: 15 },
  { name: 'Grilled Chicken', category: 'meat', price: 90, stock: 80, description: 'Tender grilled chicken pieces', threshold: 15 },
  { name: 'Bacon Bits', category: 'meat', price: 85, stock: 70, description: 'Crispy smoked bacon pieces', threshold: 12 },
  { name: 'Italian Sausage', category: 'meat', price: 95, stock: 60, description: 'Seasoned Italian pork sausage', threshold: 10 },
  { name: 'Salami', category: 'meat', price: 88, stock: 65, description: 'Thinly sliced dry salami', threshold: 10 }
];

const seedAdmin = {
  name: 'Admin User',
  email: 'admin@pizzapalace.com',
  password: 'Admin@123',
  role: 'admin',
  isEmailVerified: true,
  phone: '+91 9876543210',
  address: '1 Pizza Palace HQ, Food Street'
};

const seedUser = {
  name: 'Test User',
  email: 'user@test.com',
  password: 'User@123',
  role: 'user',
  isEmailVerified: true,
  phone: '+91 9876543211',
  address: '42 Main Road, Bangalore'
};

async function seed() {
  await connectDB();

  try {
    await Inventory.deleteMany({});
    await Inventory.insertMany(seedData);
    console.log('✅ Inventory seeded!');

    // Seed admin
    const existingAdmin = await User.findOne({ email: seedAdmin.email });
    if (!existingAdmin) {
      await User.create(seedAdmin);
      console.log('✅ Admin user seeded! Email: admin@pizzapalace.com | Password: Admin@123');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Seed test user
    const existingUser = await User.findOne({ email: seedUser.email });
    if (!existingUser) {
      await User.create(seedUser);
      console.log('✅ Test user seeded! Email: user@test.com | Password: User@123');
    } else {
      console.log('ℹ️  Test user already exists');
    }

    console.log('\n🍕 Database seeding complete!');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

seed();
