import { body, validationResult } from 'express-validator';
import ErrorHandler from '../utils/errorHandler.js';

const registerValidator = () => [
    
    body('name', 'Please enter a name').notEmpty(),


    body('mobile_No', 'Please enter a mobile number')
        .notEmpty()
        .isNumeric().withMessage('Mobile number must be numeric')
        .isLength({ min: 10, max: 15 }).withMessage('Mobile number must be between 10 and 15 digits'),


    body('email', 'Please enter a valid email address')
        .notEmpty()
        .isEmail().withMessage('Please enter a valid email address'),

    body('gender', 'Please enter gender').notEmpty(),

    body('password', 'Please enter a password').notEmpty(),
];

const validateHandler = (req, res, next) => {
    const errors = validationResult(req);
    const errorMessages = errors.array().map((error) => error.msg).join(', ');

    if (errors.isEmpty()) {
        return next();
    } else {
        next(new ErrorHandler(errorMessages, 400));
    }
};

export { registerValidator, validateHandler };
