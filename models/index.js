import User from './user.js';
import Category from './category.js';
import Product from './product.js';
import ProductOption from './productOption.js';
import OptionValue from './optionValue.js';
import ProductVariant from './productVariant.js';
import VariantOptionValue from './variantOptionValue.js';
import Cart from './cart.js';
import CartItem from './cartItem.js';
import Order from './order.js';
import OrderItem from './orderItem.js';
import Payment from './payment.js';
import Review from './review.js';
import Slider from './slider.js';

// Category
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

// Product
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Product.hasMany(Review, { foreignKey: 'productId' });
Product.hasMany(ProductOption, { foreignKey: 'productId' });
Product.hasMany(ProductVariant, { foreignKey: 'productId' });

// ProductOption
ProductOption.belongsTo(Product, { foreignKey: 'productId' });
ProductOption.hasMany(OptionValue, { foreignKey: 'optionId' });

// OptionValue
OptionValue.belongsTo(ProductOption, { foreignKey: 'optionId' });
OptionValue.belongsToMany(ProductVariant, { through: VariantOptionValue, foreignKey: 'optionValueId' });

// ProductVariant
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });
ProductVariant.belongsToMany(OptionValue, { through: VariantOptionValue, foreignKey: 'variantId' });

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
  Product, ProductOption, OptionValue, ProductVariant, VariantOptionValue,
  Cart, CartItem,
  Order, OrderItem, Payment,
  Review, Slider,
};
