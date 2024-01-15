import { Model } from "mongoose";
import { USER_ROLE } from "./user.constant";
import { Document } from "mongoose";

export interface TUser extends Document {
  username: string;
  email: string;
  role: "user" | "admin";
oldOnePasswordChangeAt?: Date;
oldTwoPasswordChangeAt?: Date;
passwordChangeAt?: Date;

oldOnePassword?: string;
oldTwoPassword?: string;
  password: string;
};




export interface UserModel extends  Model<TUser> {
  //instance methods for checking if the user exist
  isUserExistsByUsername(username: string): Promise<TUser>;
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}


export type TUserRole = keyof typeof USER_ROLE;