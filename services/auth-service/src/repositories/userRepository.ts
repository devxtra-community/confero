import { IUser, UserModel } from '../models/userModel.js';

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
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
};
