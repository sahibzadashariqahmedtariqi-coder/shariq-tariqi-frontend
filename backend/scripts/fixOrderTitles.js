import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import Course from '../models/Course.js';
import Product from '../models/Product.js';

dotenv.config();

const fixOrderTitles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all orders with incorrect titles
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to check`);

    let updated = 0;

    for (const order of orders) {
      let correctTitle = null;

      if (order.orderType === 'course') {
        const course = await Course.findById(order.itemId);
        if (course) {
          correctTitle = course.title;
        }
      } else if (order.orderType === 'product') {
        const product = await Product.findById(order.itemId);
        if (product) {
          correctTitle = product.name;
        }
      } else if (order.orderType === 'appointment') {
        correctTitle = 'Spiritual Consultation Appointment';
      }

      if (correctTitle && correctTitle !== order.itemTitle) {
        order.itemTitle = correctTitle;
        await order.save();
        console.log(`✅ Updated order ${order.orderNumber}: ${order.itemTitle}`);
        updated++;
      }
    }

    console.log(`\n✅ Fixed ${updated} orders`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixOrderTitles();
