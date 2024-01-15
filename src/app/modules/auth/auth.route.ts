import express from 'express';
import {  AuthControllers } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidations } from './auth.validation';
import auth from '../../middlewares/auth';

const router = express.Router();
router.post('/login',
validateRequest(AuthValidations.loginValidationSchema),
AuthControllers.loginUser);
router.post('/change-password',
validateRequest(AuthValidations.changePasswordValidationSchema),
auth(),
AuthControllers.ChangeUserPassword);



router.post('/register',
validateRequest(AuthValidations.registerValidationSchema),

AuthControllers.register
)


export const AuthRoutes = router;
