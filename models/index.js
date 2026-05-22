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

// Category
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

// Product
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Product.hasMany(ProductVariant, { foreignKey: 'productId' });
Product.hasMany(ProductImage, { foreignKey: 'productId' });
Product.hasMany(Review, { foreignKey: 'productId' });

// ProductVariant
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });
ProductVariant.hasMany(CartItem, { foreignKey: 'productVariantId' });
ProductVariant.hasMany(OrderItem, { foreignKey: 'productVariantId' });

// Cart
User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'productVariantId' });

// Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
Order.hasOne(Payment, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'productVariantId' });

// Payment
Payment.belongsTo(Order, { foreignKey: 'orderId' });

// Review
Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Product, { foreignKey: 'productId' });
Review.belongsTo(OrderItem, { foreignKey: 'orderItemId' });

export {
  User, Category, Product, ProductVariant, ProductImage,
  Cart, CartItem, Order, OrderItem, Payment, Review,
};
