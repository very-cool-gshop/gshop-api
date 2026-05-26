import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { register, login, me, changePassword } from '../controllers/authController.js';
import { getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  createVariant, updateVariant, deleteVariant,
} from '../controllers/productController.js';
import { getReviews, createReview, updateReview, deleteReview } from '../controllers/reviewController.js';
import { getOrders, getOrder, createOrder, updateOrderStatus } from '../controllers/orderController.js';
import { getPayment, createPayment } from '../controllers/paymentController.js';
import { getCart, addCartItem, updateCartItem, removeCartItem, checkout } from '../controllers/cartController.js';
import { getSliders, adminGetSliders, createSlider, updateSlider, deleteSlider } from '../controllers/sliderController.js';

const router = Router();
const adminOnly = authorize('admin');

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Sliders (前台公開)
router.get('/sliders', getSliders);

// Auth (public)
router.post('/auth/register', register);
router.post('/auth/login', login);

router.use(authenticate);

// Auth (protected)
router.get('/auth/me', me);
router.patch('/auth/change-password', changePassword);

// Users (admin only)
router.get('/users/:id', adminOnly, getUser);
router.patch('/users/:id', adminOnly, updateUser);
router.delete('/users/:id', adminOnly, deleteUser);

// Categories (read: all, write: admin only)
router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.post('/categories', adminOnly, createCategory);
router.patch('/categories/:id', adminOnly, updateCategory);
router.delete('/categories/:id', adminOnly, deleteCategory);

// Products (read: all, write: admin only)
router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.post('/products', adminOnly, createProduct);
router.patch('/products/:id', adminOnly, updateProduct);
router.delete('/products/:id', adminOnly, deleteProduct);

// Product Variants (admin only)
router.post('/products/:id/variants', adminOnly, createVariant);
router.patch('/products/:id/variants/:variantId', adminOnly, updateVariant);
router.delete('/products/:id/variants/:variantId', adminOnly, deleteVariant);

// Reviews
router.get('/products/:productId/reviews', getReviews);
router.post('/products/:productId/reviews', createReview);
router.patch('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

// Orders
router.get('/orders', getOrders);
router.get('/orders/:id', getOrder);
router.post('/orders', createOrder);
router.patch('/orders/:id/status', adminOnly, updateOrderStatus);

// Payments
router.get('/orders/:orderId/payment', getPayment);
router.post('/orders/:orderId/payment', createPayment);

// Cart
router.get('/cart/:userId', getCart);
router.post('/cart/:userId/items', addCartItem);
router.patch('/cart/:userId/items/:itemId', updateCartItem);
router.delete('/cart/:userId/items/:itemId', removeCartItem);
router.post('/cart/checkout', checkout);

// Sliders (後台管理，admin only)
router.get('/admin/sliders', adminOnly, adminGetSliders);
router.post('/admin/sliders', adminOnly, createSlider);
router.patch('/admin/sliders/:id', adminOnly, updateSlider);
router.delete('/admin/sliders/:id', adminOnly, deleteSlider);

export default router;
