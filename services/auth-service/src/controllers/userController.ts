import { Request, Response } from 'express';
import { userRepository } from '../repositories/userRepository.js';
import { userService } from '../services/userService.js';
import { getPublicUrlForKey } from '../utils/r2Upload.js';
import { reportService } from '../services/reportService.js';

export const currentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'invalid token or expired' });
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const obj =
      typeof (user as any).toObject === 'function'
        ? (user as any).toObject()
        : user;

    return res.status(200).json({
      message: 'user details fetched succesffully',
      user: {
        ...obj,
        profilePicture: obj.profilePicture
          ? getPublicUrlForKey(obj.profilePicture)
          : null,
        bannerPicture: obj.bannerPicture
          ? getPublicUrlForKey(obj.bannerPicture)
          : null,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'internal server error', err });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const updatedUser = await userService.updateUserDetails(userId, req.body);

    const obj =
      typeof (updatedUser as any).toObject === 'function'
        ? (updatedUser as any).toObject()
        : updatedUser;

    res.status(200).json({
      success: true,
      user: {
        ...obj,
        profilePicture: obj.profilePicture
          ? getPublicUrlForKey(obj.profilePicture)
          : null,
        bannerPicture: obj.bannerPicture
          ? getPublicUrlForKey(obj.bannerPicture)
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'failed to update user details..', err });
  }
};

export const addSkill = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, level } = req.body;

    const skills = await userService.addSkill(
      userId,
      name,
      level ?? 'beginner'
    );

    return res.status(201).json({ success: true, skills });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add users skill..', err });
  }
};

export const removeSkill = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { key } = req.params;

    const skills = await userService.removeSkill(userId, key);

    return res.status(200).json({ success: true, skills });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove users skills', err });
  }
};

export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await userService.getPublicProfile(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', err });
  }
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function getExtensionFromMime(mime: string) {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return null;
}

function ensureUserOwnsKey(userId: string, key: string) {
  if (!key.startsWith(`users/${userId}/`)) {
    throw new Error('Invalid object key');
  }
}

export const getAvatarUploadUrl = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { contentType } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!contentType) {
      return res.status(400).json({ message: 'contentType is required' });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return res.status(400).json({ message: 'Unsupported image type' });
    }

    const ext = getExtensionFromMime(contentType);

    if (!ext) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    const result = await userService.createAvatarUploadUrl(
      userId,
      contentType,
      ext
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create upload url' });
  }
};

export const completeAvatarUpload = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { key } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!key) {
      return res.status(400).json({ message: 'key is required' });
    }

    ensureUserOwnsKey(userId, key);

    const updatedUser = await userService.finalizeAvatarUpload(userId, key);

    const obj =
      typeof (updatedUser as any).toObject === 'function'
        ? (updatedUser as any).toObject()
        : updatedUser;

    return res.status(200).json({
      success: true,
      user: {
        ...obj,
        profilePicture: obj.profilePicture
          ? getPublicUrlForKey(obj.profilePicture)
          : null,
        bannerPicture: obj.bannerPicture
          ? getPublicUrlForKey(obj.bannerPicture)
          : null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Finalize failed' });
  }
};

export const getBannerUploadUrl = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { contentType } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!contentType) {
      return res.status(400).json({ message: 'contentType is required' });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return res.status(400).json({ message: 'Unsupported image type' });
    }

    const ext = getExtensionFromMime(contentType);

    if (!ext) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    const result = await userService.createBannerUploadUrl(
      userId,
      contentType,
      ext
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create upload url' });
  }
};

export const completeBannerUpload = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { key } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!key) {
      return res.status(400).json({ message: 'key is required' });
    }

    ensureUserOwnsKey(userId, key);

    const updatedUser = await userService.finalizeBannerUpload(userId, key);

    const obj =
      typeof (updatedUser as any).toObject === 'function'
        ? (updatedUser as any).toObject()
        : updatedUser;

    return res.status(200).json({
      success: true,
      user: {
        ...obj,
        profilePicture: obj.profilePicture
          ? getPublicUrlForKey(obj.profilePicture)
          : null,
        bannerPicture: obj.bannerPicture
          ? getPublicUrlForKey(obj.bannerPicture)
          : null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Finalize failed' });
  }
};

export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedUser = await userService.deleteAvatar(userId);

    const obj = updatedUser.toObject();

    return res.status(200).json({
      message: 'Profile picture removed',
      user: {
        ...obj,
        profilePicture: null,
        bannerPicture: obj.bannerPicture
          ? getPublicUrlForKey(obj.bannerPicture)
          : null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Delete failed' });
  }
};

export const reportUser = async (req: Request, res: Response) => {
  const { reportedUserId, reason } = req.body;
  const userId = req.user?.id;

  await reportService.reportUser(reportedUserId, userId, reason);

  res.json({ success: true });
};
