import { body } from "express-validator";

const registerValidation = [
    body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 4 characters long and.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores.'),

    body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
    
    body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 128 })
    .withMessage('Name must be between 2 and 128 characters long.'),
    
    body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 6 characters long.')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.')
    .matches(/[@$!%*?&]/)
    .withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &).')
]

const loginValidation = [
    body('username')
    .notEmpty()
    .withMessage('Username is required.'),  

    body('password')
    .notEmpty()
    .withMessage('Password is required.')    
]

export { registerValidation, loginValidation };