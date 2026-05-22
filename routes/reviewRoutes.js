import { Router } from 'express';
import { updateReview, deleteReview } from '../controllers/reviewController.js';

const router = Router();

router.patch('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

export default router;
