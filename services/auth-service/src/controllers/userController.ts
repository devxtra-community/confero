import { Request, Response } from 'express';
import { userRepository } from '../repositories/userRepository.js';
import { userService } from '../services/userService.js';
import {
  uploadToR2,
} from '../utils/r2Upload.js';

export const currentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'invalid token or expired' });
    }
    const user = await userRepository.findById(userId);
    return res
      .status(200)
      .json({ message: 'user details fetched succesffully', user });
  } catch (err) {
    return res.status(500).json({ message: 'internal server error', err });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const updatedUser = await userService.updateUserDetails(userId, req.body);
    res.status(200).json({ success: true, user: updatedUser });
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

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file received' });
    }

    const result = await uploadToR2(req.file, userId);

    const updatedUser = await userService.uploadAvatar(userId, result.url);

    return res.status(200).json({
      message: 'Profile picture uploaded',
      url: result.url,
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Upload failed' });
  }
};

export const uploadBanner = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file received' });
    }

    const result = await uploadToR2(req.file, userId);

    const updatedUser = await userService.uploadBanner(userId, result.url);

    return res.status(200).json({
      message: 'Banner image uploaded',
      url: result.url,
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Upload failed' });
  }
};

export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedUser = await userService.deleteAvatar(userId);

    return res.status(200).json({
      message: 'Profile picture removed',
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Delete failed' });
  }
};
