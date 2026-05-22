import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { getVariants, createVariant, updateVariant, deleteVariant } from '../controllers/productVariantController.js';
import { addImage, deleteImage } from '../controllers/productImageController.js';
import { getReviews, createReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/products/:productId/variants', getVariants);
router.post('/products/:productId/variants', createVariant);
router.patch('/products/:productId/variants/:variantId', updateVariant);
router.delete('/products/:productId/variants/:variantId', deleteVariant);

router.post('/products/:productId/images', addImage);
router.delete('/products/:productId/images/:imageId', deleteImage);

router.get('/products/:productId/reviews', getReviews);
router.post('/products/:productId/reviews', createReview);

export default router;
