import { Router } from 'express';
import { createUser, getUser, updateUser, deleteUser } from '../controllers/userController.js';

const router = Router();

router.post('/users', createUser);
router.get('/users/:id', getUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
