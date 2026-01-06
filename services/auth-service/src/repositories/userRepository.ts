import { UserModel } from '../models/userModel.js';

export interface createUserInput {
  email: string;
  password: string;
  firstName:string
}

export const userRepository = {
  findByEmail: async (email: string) => {
    return UserModel.findOne({ email }).exec();
  },

  findById: async (id: string) => {
    return UserModel.findById({ id }).exec();
  },
  create: async (data: createUserInput) => {
    return UserModel.create(data);
  },
};
