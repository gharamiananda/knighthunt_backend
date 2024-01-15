import { z } from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    username: z.string({ required_error: 'userName is required.' }),
    password: z.string({ required_error: 'Password is required' }).refine((val) => val.length >= 8 && val.length <= 16, {
      message: "Password must be between 8 and 16 characters long",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Password must contain at least one special character",
    }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Current password is required',
    }),
    newPassword: z.string({ required_error: 'Password is required' }),
  }).refine(data => data.currentPassword !== data.newPassword, {
    message: 'Current password and new password should not be the same',
    path: ['body', 'newPassword'],
  }).refine((val) => val.newPassword.length >= 8 && val.newPassword.length <= 16, {
    message: "Password must be between 8 and 16 characters long",
  })
  .refine((val) => /[A-Z]/.test(val.newPassword), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((val) => /[a-z]/.test(val.newPassword), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val.newPassword), {
    message: "Password must contain at least one special character",
  })
  
})

const registerValidationSchema = z.object({
  body: z.object({

  username:z.string(),
  password:z.string().refine((val) => val.length >= 8 && val.length <= 16, {
    message: "Password must be between 8 and 16 characters long",
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Password must contain at least one special character",
  }),
  email:z.string(),
  })
 
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({
      required_error: 'User id is required!',
    }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({
      required_error: 'User id is required!',
    }),
    newPassword: z.string({
      required_error: 'User password is required!',
    }),
  }),
});

export const AuthValidations = {
  loginValidationSchema,
  changePasswordValidationSchema,
  registerValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
};