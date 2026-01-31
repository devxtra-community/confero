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

  addSkill: async (
    userId: string,
    name: string,
    level: 'beginner' | 'intermediate' | 'advanced'
  ) => {
    if (!name.trim()) {
      throw new AppError('Skill name required', 400);
    }

    const key = name.trim().toLowerCase();
    const label = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    const updated = await userRepository.addSkill(userId, {
      key,
      label,
      level,
    });

    if (!updated) {
      throw new AppError('User not found', 404);
    }

    return updated.skills;
  },

  removeSkill: async (userId: string, key: string) => {
    const updated = await userRepository.removeSkill(userId, key);

    if (!updated) {
      throw new AppError('User not found', 404);
    }

    return updated.skills;
  },

  getPublicProfile: async (userId: string) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('user not found', 404);
    }

    return {
      id: user._id,
      name: user.fullName,
      skills: user.skills,
      jobTitle: user.jobTitle,
      image: user.profilePicture,
    };
  },
};
