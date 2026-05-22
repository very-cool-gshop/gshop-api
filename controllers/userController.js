import User from '../models/user.js';
import catchAsync from '../utils/catchAsync.js';

export const createUser = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });
  res.status(201).json(user);
});
