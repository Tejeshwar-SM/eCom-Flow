import Joi from 'joi';

export const checkoutValidationSchema = Joi.object({
  customer: Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    address: Joi.string().min(5).max(200).required(),
    city: Joi.string().min(2).max(50).required(),
    state: Joi.string().min(2).max(50).required(),
    zipCode: Joi.string().pattern(/^[0-9]{5,6}$/).required()
  }).required(),
  
  payment: Joi.object({
    cardNumber: Joi.string().pattern(/^[0-9]{16}$/).required(),
    expiryDate: Joi.string().pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/).required(),
    cvv: Joi.string().pattern(/^[0-9]{3}$/).required()
  }).required(),
  
  product: Joi.object({
    productId: Joi.string().required(),
    selectedVariants: Joi.object().pattern(Joi.string(), Joi.string()),
    quantity: Joi.number().integer().min(1).required()
  }).required()
});

export const validateExpiryDate = (expiryDate: string): boolean => {
  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1;
  
  const expYear = parseInt(year);
  const expMonth = parseInt(month);
  
  if (expYear > currentYear) return true;
  if (expYear === currentYear && expMonth >= currentMonth) return true;
  
  return false;
};
