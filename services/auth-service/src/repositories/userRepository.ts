import { IUser, UserModel } from '../models/userModel.js';

export interface CreateUserInput {
  email: string;
  password?: string;
  fullName: string;
  authProvider?: 'local' | 'google';
  googleId?: string;
  emailVerified?: boolean;
}

export type UpdateUserProfileInput = Partial<
  Pick<
    IUser,
    | 'fullName'
    | 'jobTitle'
    | 'linkedinId'
    | 'age'
    | 'sex'
    | 'profilePicture'
    | 'availableForCall'
  >
>;

export const userRepository = {
  findByEmail(email: string) {
    return UserModel.findOne({ email }).exec();
  },

  findById(id: string) {
    return UserModel.findById(id).exec();
  },

  create(data: CreateUserInput) {
    return UserModel.create(data);
  },

  updateProfileById(userId: string, data: UpdateUserProfileInput) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true }
    ).exec();
  },

  updateById(userId: string, data: Partial<IUser>) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true }
    ).exec();
  },

  updateByEmail(email: string, data: Partial<IUser>) {
    return UserModel.updateOne({ email }, { $set: data }).exec();
  },

  addSkill(
    userId: string,
    skill: {
      key: string;
      label: string;
      level: 'beginner' | 'intermediate' | 'advanced';
    }
  ) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: { skills: skill },
      },
      { new: true }
    ).exec();
  },

  removeSkill(userId: string, key: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: { skills: { key } },
      },
      { new: true }
    ).exec();
  },

  updateRole(userId: string, role: 'user' | 'admin') {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true }
    ).exec();
  },

  updateLastLogin(userId: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: { lastLoginAt: new Date() } },
      { new: true }
    ).exec();
  },

  updateAccountStatus(
    userId: string,
    status: 'active' | 'suspended' | 'deleted'
  ) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: { accountStatus: status } },
      { new: true }
    ).exec();
  },
};
