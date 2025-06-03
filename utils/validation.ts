import * as yup from 'yup';

// Login validation schema
export const loginSchema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

// Registration validation schema
export const registerSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  role: yup.string().oneOf(['customer', 'admin'], 'Invalid role').required('Role is required'),
  city: yup.string().required('City is required'),
});

// Address validation schema
export const addressSchema = yup.object({
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup
    .string()
    .matches(/^\d{6}$/, 'Zip code must be 6 digits')
    .required('Zip code is required'),
});

// Product validation schema
export const productSchema = yup.object({
  name: yup.string().required('Product name is required'),
  description: yup.string().required('Description is required'),
  price: yup
    .number()
    .positive('Price must be positive')
    .required('Price is required'),
  quantity: yup
    .number()
    .integer('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .required('Quantity is required'),
  category: yup.string().required('Category is required'),
  shopId: yup.number().required('Shop ID is required'),
});

// Profile update validation schema
export const profileUpdateSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  city: yup.string().required('City is required'),
});

// Password change validation schema
export const passwordChangeSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});