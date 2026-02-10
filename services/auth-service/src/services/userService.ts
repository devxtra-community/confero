import { AppError } from '../middlewares/errorHandller.js';
import { userRepository } from '../repositories/userRepository.js';

import {
  buildAvatarKey,
  buildBannerKey,
  deleteFromR2,
  getPublicUrlForKey,
  getSignedUploadUrl,
} from '../utils/r2Upload.js';

export interface updateUserProfile {
  username?: string;
  jobTitle?: string;
  linkedinId?: string;
  age?: number;
  sex?: string;
  profilePicture?: string;
  bannerPicture?: string;
}

export const userService = {
  /* ------------------------------------------------------------------ */
  /* ------------------------ existing logic -------------------------- */
  /* ------------------------------------------------------------------ */

  updateUserDetails: async (userId: string, payload: updateUserProfile) => {
    if (!userId) throw new AppError('Unauthorized', 401);

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

    if (!updatedUser) throw new AppError('User not found', 404);

    return updatedUser;
  },

  /**
   * OLD FLOW (kept so nothing breaks if something still calls it)
   * You should stop using this from controllers.
   */
  uploadAvatar: async (userId: string, avatarUrl: string) => {
    if (!userId) throw new AppError('Unauthorized', 401);
    if (!avatarUrl) throw new AppError('Avatar URL is required', 400);

    const updatedUser = await userRepository.updateProfileById(userId, {
      profilePicture: avatarUrl,
    });

    if (!updatedUser) throw new AppError('User not found', 404);

    return updatedUser;
  },

  /**
   * OLD FLOW (kept)
   */
  uploadBanner: async (userId: string, bannerUrl: string) => {
    if (!userId) throw new AppError('Unauthorized', 401);
    if (!bannerUrl) throw new AppError('Banner URL is required', 400);

    const updatedUser = await userRepository.updateProfileById(userId, {
      bannerPicture: bannerUrl,
    });

    if (!updatedUser) throw new AppError('User not found', 404);

    return updatedUser;
  },

  addSkill: async (
    userId: string,
    name: string,
    level: 'beginner' | 'intermediate' | 'advanced'
  ) => {
    if (!name.trim()) throw new AppError('Skill name required', 400);

    const key = name.trim().toLowerCase();
    const label = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    const updated = await userRepository.addSkill(userId, {
      key,
      label,
      level,
    });

    if (!updated) throw new AppError('User not found', 404);

    return updated.skills;
  },

  removeSkill: async (userId: string, key: string) => {
    const updated = await userRepository.removeSkill(userId, key);

    if (!updated) throw new AppError('User not found', 404);

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
      image: user.profilePicture
        ? getPublicUrlForKey(user.profilePicture)
        : null,
    };
  },

  /* ------------------------------------------------------------------ */
  /* ------------------ NEW SIGNED UPLOAD FLOW ------------------------ */
  /* ------------------------------------------------------------------ */

  createAvatarUploadUrl: async (
    userId: string,
    contentType: string,
    ext: string
  ) => {
    if (!userId) throw new AppError('Unauthorized', 401);

    const key = buildAvatarKey(userId, ext);

    const uploadUrl = await getSignedUploadUrl({
      key,
      contentType,
    });

    return {
      key,
      uploadUrl,
    };
  },

  finalizeAvatarUpload: async (userId: string, key: string) => {
    if (!userId) throw new AppError('Unauthorized', 401);

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (user.profilePicture && user.profilePicture !== key) {
      await deleteFromR2(user.profilePicture);
    }

    const updated = await userRepository.updateProfileById(userId, {
      profilePicture: key,
    });

    if (!updated) throw new AppError('User not found', 404);

    const obj = updated.toObject();

    return {
      ...obj,
      profilePicture: getPublicUrlForKey(key),
    };
  },

  createBannerUploadUrl: async (
    userId: string,
    contentType: string,
    ext: string
  ) => {
    if (!userId) throw new AppError('Unauthorized', 401);

    const key = buildBannerKey(userId, ext);

    const uploadUrl = await getSignedUploadUrl({
      key,
      contentType,
    });

    return {
      key,
      uploadUrl,
    };
  },

  finalizeBannerUpload: async (userId: string, key: string) => {
    if (!userId) throw new AppError('Unauthorized', 401);

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (user.bannerPicture && user.bannerPicture !== key) {
      await deleteFromR2(user.bannerPicture);
    }

    const updated = await userRepository.updateProfileById(userId, {
      bannerPicture: key,
    });

    if (!updated) throw new AppError('User not found', 404);

    const obj = updated.toObject();

    return {
      ...obj,
      bannerPicture: getPublicUrlForKey(key),
    };
  },

  /* ------------------------------------------------------------------ */
  /* ------------------ delete avatar (updated) ----------------------- */
  /* ------------------------------------------------------------------ */

  deleteAvatar: async (userId: string) => {
    if (!userId) throw new AppError('Unauthorized', 401);

    const user = await userRepository.findById(userId);

    if (!user) throw new AppError('User not found', 404);

    if (!user.profilePicture) {
      return user;
    }

    await deleteFromR2(user.profilePicture);

    const updatedUser = await userRepository.updateProfileById(userId, {
      profilePicture: null,
    });

    if (!updatedUser) throw new AppError('User not found', 404);

    return updatedUser;
  },
};
