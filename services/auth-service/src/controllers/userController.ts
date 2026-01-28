import { Request, Response } from 'express';
import { userRepository } from '../repositories/userRepository.js';
import { userService } from '../services/userService.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '../config/r2.js';

// 1. Put the function at the top of the file
type RawSkill =
  | string
  | {
      name: string;
      level?: 'beginner' | 'intermediate' | 'advanced';
    };

function normalizeSkills(rawSkills: RawSkill[]) {
  const map = new Map<
    string,
    {
      key: string;
      label: string;
      level: 'beginner' | 'intermediate' | 'advanced';
    }
  >();

  for (const skill of rawSkills) {
    let name: string;
    let level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';

    if (typeof skill === 'string') {
      name = skill;
    } else if (typeof skill === 'object' && skill.name) {
      name = skill.name;
      level = skill.level ?? 'beginner';
    } else {
      continue;
    }

    const trimmed = name.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    const label =
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();

    map.set(key, { key, label, level });
  }

  return Array.from(map.values());
}

// 2. Your controller uses it here
export const updateSkills = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log(userId);
    const rawSkills = req.body.skills;

    if (!Array.isArray(rawSkills)) {
      return res.status(400).json({ message: 'skills must be an array' });
    }

    const normalized = normalizeSkills(rawSkills);

    const updated = await userRepository.updateById(userId, {
      skills: normalized,
    });

    if (!updated) {
      return res.status(400).json({ message: 'Update failed' });
    }

    return res.json({
      message: 'Skills updated successfully',
      updated,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', err });
  }
};

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
  const userId = req.user?.id;
  const updatedUser = await userService.updateUserDetails(userId, req.body);
  res.status(200).json({ success: true, user: updatedUser });
};

export const uploadAvatar = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // console.log('file:', req.file);
    // console.log('user:', req.user);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const key = `avatars/${userId}-${Date.now()}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const imageUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    const updated = await userRepository.updateById(userId, {
      profilePicture: imageUrl,
    });

    res.json({
      message: 'Profile picture uploaded',
      url: imageUrl,
      user: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};
