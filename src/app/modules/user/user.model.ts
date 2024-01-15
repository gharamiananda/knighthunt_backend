import { Schema, model } from "mongoose";
import { TUser, UserModel } from "./user.interface";
import config from "../../config";
import bcrypt from 'bcrypt'

const userSchema = new Schema<TUser,UserModel>({
  role: {
    type: String,
    enum: ["user", "admin"],
default:'user',
    required: true,
  },
  email: {
    type: String,
unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select:0
  },
   username: {
    type: String,
unique: true,
    required: true,
  },
  oldOnePasswordChangeAt: {
    type: Date,
    default: new Date(),
    select:0
  },oldTwoPasswordChangeAt: {
    type: Date,
    default: new Date(),
    
    select:0
  },oldOnePassword: {
    type: String,
    default:'1',
    select:0
  },oldTwoPassword: {
    type: String,
    default:'2',
    
    select:0
  },
  passwordChangeAt: {
    type: Date,
    
    select:0
  },
  

 
},{
  timestamps: true
});


userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this; // doc
  // hashing password and save into DB

  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );

  next();
});

function transform(doc: any, ret: any): any {
  delete ret.password;
  delete ret.oldOnePassword;
  delete ret.oldTwoPassword;
  delete ret.passwordChangeAt;
  delete ret.oldOnePasswordChangeAt;
  delete ret.oldTwoPasswordChangeAt;
  delete ret.__v;
  return ret;
}

userSchema.set('toJSON', { transform });

userSchema.statics.isUserExistsByUsername = async function (username: string) {
  return await User.findOne({ username }).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};


export const User = model<TUser,UserModel>("User", userSchema);
