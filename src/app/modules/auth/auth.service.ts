import httpStatus, { BAD_REQUEST } from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TUserLogin } from './auth.interface';
import { createToken } from './auth.utils';
import config from '../../config';
import bcrypt from 'bcrypt'
import jwt,{ JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { TUser } from '../user/user.interface';

const  loginUser = async (payload:TUserLogin) => {
 // checking if the user is exist

 const user = await User.isUserExistsByUsername(payload.username);

 if (!user) {
   throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !','data');
 }


 //checking if the password is correct

 if (!(await User.isPasswordMatched(payload?.password, user?.password)))
   throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched','data');

 //create token and sent to the  client
 

 const jwtPayload = {
   _id:user?._id ,
   role: user.role,
   email:user.email,

 };


 const token = createToken(
   jwtPayload,
   config.jwt_access_secret as string,
   config.jwt_access_expires_in as string
 );


 return {
   token,user
 };

// return user

};


const  ChangeUserPassword = async (userData:JwtPayload,payload:{newPassword:string,currentPassword:string}) => {
  // checking if the user is exist

  
  const user = await User.findById(userData._id).select('+oldOnePasswordChangeAt +oldTwoPasswordChangeAt +password +oldOnePassword +oldTwoPassword');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !','data');
  }
 
 
  //checking if the password is correct
 
  if (!(await User.isPasswordMatched(payload?.currentPassword, user?.password))){

    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched','errorMessage','data');
  }


  const {oldOnePasswordChangeAt,oldTwoPasswordChangeAt,password,oldOnePassword,oldTwoPassword,passwordChangeAt}=user;

  //checking if the  first password is correct
 
  if ((await User.isPasswordMatched(payload?.newPassword, oldOnePassword as string))){

    throw new AppError(400,  `Password change failed. Ensure the new password is unique and not among the last 2 used (last used on ${oldOnePasswordChangeAt}).`,'errorMessage errorDetails stack');
  }
 
 
 //checking if the  second password is correct
 
 if ((await User.isPasswordMatched(payload?.newPassword, oldTwoPassword as string))){

  throw new AppError(400,  `Password change failed. Ensure the new password is unique and not among the last 2 used (last used on ${oldTwoPasswordChangeAt}).`,'errorMessage errorDetails stack');
}





  


 const newPassword = await bcrypt.hash(
  payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );


  const updatedUser= await User.findByIdAndUpdate(userData._id,{password:newPassword,oldOnePasswordChangeAt:passwordChangeAt,oldTwoPasswordChangeAt:oldOnePasswordChangeAt,oldOnePassword:password,oldTwoPassword:oldOnePassword,passwordChangeAt:new Date()},{new:true}).select('+oldOnePasswordChangeAt +oldTwoPasswordChangeAt +password +oldOnePassword +oldTwoPassword');
 
  return updatedUser
 
 // return user
 
 };




const  register = async (payload: TUser) => {
    // create a user object
  
      
  
     
  
      // create a user session 1 transection
      const newUser = await User.create({...payload, passwordChangeAt:new Date()});
  
  
  
      return newUser;
  
  
 };

export const AuthServices = {
  loginUser,
  ChangeUserPassword,
  register
};
