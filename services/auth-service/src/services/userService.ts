import { AppError } from '../middlewares/errorHandller.js';
import { userRepository } from '../repositories/userRepository.js';

export interface updateUserProfile {
  username?: string;
  jobTitle?: string;
  linkedinId?: string;
  age?: number;
  sex?: string;
}

export const userService = {
  updateUserDetails: async (userId: string, payload: updateUserProfile) => {
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    const updateData: updateUserProfile = {};
    if (payload.username !== undefined) updateData.username = payload.username;

    if (payload.jobTitle !== undefined) updateData.jobTitle = payload.jobTitle;

    if (payload.linkedinId !== undefined)
      updateData.linkedinId = payload.linkedinId;

    if (payload.age !== undefined) updateData.age = payload.age;

    if (payload.sex !== undefined) updateData.sex = payload.sex;

    if (Object.keys(updateData).length === 0) {
      throw new AppError('No fields to update', 400);
    }

    const updatedUser = await userRepository.updateProfileById(
      userId,
      updateData
    );
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    return updatedUser;
  },
};
