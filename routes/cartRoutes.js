import { Router } from 'express';
import { getCart, addCartItem, updateCartItem, removeCartItem } from '../controllers/cartController.js';

const router = Router();

router.get('/cart/:userId', getCart);
router.post('/cart/:userId/items', addCartItem);
router.patch('/cart/:userId/items/:itemId', updateCartItem);
router.delete('/cart/:userId/items/:itemId', removeCartItem);

export default router;
