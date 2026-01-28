import { IUser, UserModel } from '../models/userModel.js';
import { updateUserProfile } from '../services/userService.js';

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  emailVerified?: boolean;
}

export const userRepository = {
  findByEmail: async (email: string) => {
    return UserModel.findOne({ email }).exec();
  },

  findById: async (id: string) => {
    return UserModel.findById(id).exec();
  },

  create: async (data: CreateUserInput) => {
    return UserModel.create(data);
  },

  updateByEmail: async (email: string, data: Partial<IUser>) => {
    return UserModel.updateOne({ email }, data).exec();
  },
  updateById: async (id: string, data: Partial<IUser>) => {
    return UserModel.updateOne({ _id: id }, { $set: data });
  },
  updateProfileById: async (userId: string, data: updateUserProfile) => {
    return UserModel.findByIdAndUpdate(userId, { $set: data }, { new: true });
  },
};
