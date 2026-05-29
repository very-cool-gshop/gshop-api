import User from './user.js';
import Category from './category.js';
import Product from './product.js';
import ProductVariant from './productVariant.js';
import ProductImage from './productImage.js';
import ProductImageMap from './productImageMap.js';
import VariantImageMap from './variantImageMap.js';
import Cart from './cart.js';
import CartItem from './cartItem.js';
import Order from './order.js';
import OrderItem from './orderItem.js';
import Payment from './payment.js';
import Review from './review.js';
import Slider from './slider.js';

// Category
Category.hasMany(Product, { foreignKey: 'categoryId' });

// Product
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Product.hasMany(Review, { foreignKey: 'productId' });
Product.hasMany(ProductVariant, { foreignKey: 'productId' });
Product.belongsToMany(ProductImage, { through: ProductImageMap, foreignKey: 'productId', otherKey: 'imageId', as: 'images' });
ProductImage.belongsToMany(Product, { through: ProductImageMap, foreignKey: 'imageId', otherKey: 'productId' });

// ProductVariant
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });
ProductVariant.belongsToMany(ProductImage, { through: VariantImageMap, foreignKey: 'variantId', otherKey: 'imageId', as: 'images' });
ProductImage.belongsToMany(ProductVariant, { through: VariantImageMap, foreignKey: 'imageId', otherKey: 'variantId' });

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

// Slider
Slider.belongsTo(Product, { foreignKey: 'productId' });

export {
  User, Category,
  Product, ProductVariant,
  ProductImage, ProductImageMap, VariantImageMap,
  Cart, CartItem,
  Order, OrderItem, Payment,
  Review, Slider,
};
