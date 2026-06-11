import User from './user.js';
import Category from './category.js';
import Product from './product.js';
import ProductVariant from './productVariant.js';
import ProductImage from './productImage.js';
import Cart from './cart.js';
import CartItem from './cartItem.js';
import Order from './order.js';
import OrderItem from './orderItem.js';
import Payment from './payment.js';
import Review from './review.js';
import DailySnapshot from './dailySnapshot.js';
import JobLog from './jobLog.js';

// Category
Category.hasMany(Product, { foreignKey: 'categoryId' });

// Product
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Product.hasMany(Review, { foreignKey: 'productId' });
Product.hasMany(ProductVariant, { foreignKey: 'productId' });
Product.belongsTo(ProductImage, { foreignKey: 'imageId', as: 'image' });

// ProductVariant
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });
ProductVariant.belongsTo(ProductImage, { foreignKey: 'imageId', as: 'image' });

// Cart
User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variantId' });
ProductVariant.hasMany(CartItem, { foreignKey: 'variantId' });

// Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
Order.hasOne(Payment, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variantId' });

// Payment
Payment.belongsTo(Order, { foreignKey: 'orderId' });

// Review
Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Product, { foreignKey: 'productId' });
Review.belongsTo(OrderItem, { foreignKey: 'orderItemId' });

export {
  User, Category,
  Product, ProductVariant, ProductImage,
  Cart, CartItem,
  Order, OrderItem, Payment,
  Review,
  DailySnapshot,
  JobLog,
};
