import express from 'express';
import { AuthController } from './auth.controller';
import validate from '../../middlewares/validateRequest';
import { AuthValidationSchemas } from './auth.validation';
import { auth } from '../../middlewares/auth';

const router = express.Router();

router.post(
   '/register',
   validate(AuthValidationSchemas.userRegistrationSchema),
   AuthController.registerUser
);

router.post(
   '/login',
   validate(AuthValidationSchemas.userAuthenticationSchema),
   AuthController.loginUser
);

router.post(
   '/refresh-token',
   validate(AuthValidationSchemas.jwtTokenSchema),
   AuthController.refreshToken
);

router.post(
   '/change-password',
   validate(AuthValidationSchemas.changePasswordSchema),
   auth,
   AuthController.changePassword
);

export const authRoutes = router;
