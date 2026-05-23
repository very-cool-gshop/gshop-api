import { Router } from 'express';
import { createUser, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { getVariants, createVariant, updateVariant, deleteVariant } from '../controllers/productVariantController.js';
import { addImage, deleteImage } from '../controllers/productImageController.js';
import { getReviews, createReview, updateReview, deleteReview } from '../controllers/reviewController.js';
import { getOrders, getOrder, createOrder, updateOrderStatus } from '../controllers/orderController.js';
import { getPayment, createPayment } from '../controllers/paymentController.js';
import { getCart, addCartItem, updateCartItem, removeCartItem } from '../controllers/cartController.js';

const router = Router();

// Users
router.post('/users', createUser);
router.get('/users/:id', getUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Categories
router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Product Variants
router.get('/products/:productId/variants', getVariants);
router.post('/products/:productId/variants', createVariant);
router.patch('/products/:productId/variants/:variantId', updateVariant);
router.delete('/products/:productId/variants/:variantId', deleteVariant);

// Product Images
router.post('/products/:productId/images', addImage);
router.delete('/products/:productId/images/:imageId', deleteImage);

// Reviews
router.get('/products/:productId/reviews', getReviews);
router.post('/products/:productId/reviews', createReview);
router.patch('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

// Orders
router.get('/orders', getOrders);
router.get('/orders/:id', getOrder);
router.post('/orders', createOrder);
router.patch('/orders/:id/status', updateOrderStatus);

// Payments
router.get('/orders/:orderId/payment', getPayment);
router.post('/orders/:orderId/payment', createPayment);

// Cart
router.get('/cart/:userId', getCart);
router.post('/cart/:userId/items', addCartItem);
router.patch('/cart/:userId/items/:itemId', updateCartItem);
router.delete('/cart/:userId/items/:itemId', removeCartItem);

export default router;
