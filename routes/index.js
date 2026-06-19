import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { register, login, me, changePassword } from '../controllers/authController.js';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from '../controllers/productController.js';
import { getImages, uploadImage, updateImage, deleteImage } from '../controllers/productImageController.js';
import { getReviews, createReview, updateReview, deleteReview } from '../controllers/reviewController.js';
import { getOrders, getAllOrders, getOrder, createOrder, updateOrderStatus } from '../controllers/orderController.js';
import { getPayment, confirmPayment } from '../controllers/paymentController.js';
import { getCart, addCartItem, updateCartItem, removeCartItem, checkout } from '../controllers/cartController.js';
import { analyzeProductImage } from '../controllers/analyzeController.js';
import { getDashboard, getLowStock, getOrderStatusDist } from '../controllers/dashboardController.js';
import { getJobs, triggerJob, getJobLogs } from '../controllers/jobController.js';

const router = Router();
const adminOnly = authorize('admin');
const adminOrViewer = authorize('admin', 'viewer');

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), message: 'test string' }));

// Auth (public)
router.post('/auth/register', register);
router.post('/auth/login', login);

// 前台公開 (storefront read-only)
router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.get('/products/:productId/reviews', getReviews);

router.use(authenticate);

// Auth (protected)
router.get('/auth/me', me);
router.patch('/auth/change-password', changePassword);

// Users (admin only)
router.get('/users', adminOrViewer, getUsers);
router.get('/users/:id', adminOrViewer, getUser);
router.patch('/users/:id', adminOnly, updateUser);
router.delete('/users/:id', adminOnly, deleteUser);

// Categories (write: admin only)
router.post('/categories', adminOnly, createCategory);
router.patch('/categories/:id', adminOnly, updateCategory);
router.delete('/categories/:id', adminOnly, deleteCategory);

// Products (write: admin only)
router.post('/products/analyze', adminOnly, analyzeProductImage);
router.post('/products', adminOnly, createProduct);
router.patch('/products/:id', adminOnly, updateProduct);
router.delete('/products/:id', adminOnly, deleteProduct);

// Media Library (admin write, public read)
router.get('/images', getImages);
router.post('/images', adminOnly, uploadImage);
router.patch('/images/:imageId', adminOnly, updateImage);
router.delete('/images/:imageId', adminOnly, deleteImage);

// Product Variants (admin only)
router.post('/products/:id/variants', adminOnly, createVariant);
router.patch('/products/:id/variants/:variantId', adminOnly, updateVariant);
router.delete('/products/:id/variants/:variantId', adminOnly, deleteVariant);

// Reviews (write: protected)
router.post('/products/:productId/reviews', createReview);
router.patch('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

// Orders
router.get('/orders/all', adminOrViewer, getAllOrders);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrder);
router.post('/orders', createOrder);
router.patch('/orders/:id/status', adminOnly, updateOrderStatus);

// Payments
router.get('/orders/:orderId/payment', getPayment);
router.post('/orders/:orderId/payment/confirm', confirmPayment);

// Cart
router.get('/cart', getCart);
router.post('/cart/items', addCartItem);
router.patch('/cart/items/:itemId', updateCartItem);
router.delete('/cart/items/:itemId', removeCartItem);
router.post('/cart/checkout', checkout);

// Dashboard (admin only)
router.get('/dashboard', adminOrViewer, getDashboard);
router.get('/dashboard/order-status-dist', adminOrViewer, getOrderStatusDist);
router.get('/dashboard/low-stock', adminOrViewer, getLowStock);

// Jobs (admin only)
router.get('/admin/jobs', adminOrViewer, getJobs);
router.get('/admin/jobs/logs', adminOrViewer, getJobLogs);
router.post('/admin/jobs/:name/run', adminOnly, triggerJob);

export default router;
