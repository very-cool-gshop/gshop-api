const handleSequelizeErrors = (err) => {
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = Object.keys(err.fields)[0];
    return { statusCode: 409, message: `${field} already exists` };
  }
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map((e) => e.message).join(', ');
    return { statusCode: 400, message };
  }
  return null;
};

const errorHandler = (err, req, res, next) => {
  const sequelizeError = handleSequelizeErrors(err);
  if (sequelizeError) {
    return res.status(sequelizeError.statusCode).json({ message: sequelizeError.message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  if (statusCode >= 500) console.error(err);

  res.status(statusCode).json({ message });
};

export default errorHandler;
