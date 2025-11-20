import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

dotenv.config();

const checkOrder = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const order = await Order.findOne({ orderNumber: 'P56534237599' });
    console.log('\nOrder Details:');
    console.log('Order Number:', order.orderNumber);
    console.log('Order Type:', order.orderType);
    console.log('Item ID:', order.itemId);
    console.log('Current Title:', order.itemTitle);
    console.log('Amount:', order.amount);

    if (order.orderType === 'product') {
      const product = await Product.findById(order.itemId);
      if (product) {
        console.log('\n✅ Product Found:');
        console.log('Product Name:', product.name);
        console.log('Product Price:', product.price);
        
        // Update the order
        order.itemTitle = product.name;
        await order.save();
        console.log('\n✅ Order updated successfully!');
      } else {
        console.log('\n❌ Product not found in database');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkOrder();
