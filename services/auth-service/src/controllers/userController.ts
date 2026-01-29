import { Request, Response } from 'express';
import { userRepository } from '../repositories/userRepository.js';
import { userService } from '../services/userService.js';
import { uploadToR2 } from '../utils/r2Upload.js';

// 1. Put the function at the top of the file
// type RawSkill =
//   | string
//   | {
//       name: string;
//       level?: 'beginner' | 'intermediate' | 'advanced';
//     };

// function normalizeSkills(rawSkills: RawSkill[]) {
//   const map = new Map<
//     string,
//     {
//       key: string;
//       label: string;
//       level: 'beginner' | 'intermediate' | 'advanced';
//     }
//   >();

//   for (const skill of rawSkills) {
//     let name: string;
//     let level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';

//     if (typeof skill === 'string') {
//       name = skill;
//     } else if (typeof skill === 'object' && skill.name) {
//       name = skill.name;
//       level = skill.level ?? 'beginner';
//     } else {
//       continue;
//     }

//     const trimmed = name.trim();
//     if (!trimmed) continue;

//     const key = trimmed.toLowerCase();
//     const label =
//       trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();

//     map.set(key, { key, label, level });
//   }

//   return Array.from(map.values());
// }

// // 2. Your controller uses it here
// export const updateSkills = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     console.log(userId);
//     const rawSkills = req.body.skills;

//     if (!Array.isArray(rawSkills)) {
//       return res.status(400).json({ message: 'skills must be an array' });
//     }

//     const normalized = normalizeSkills(rawSkills);

//     const updated = await userRepository.updateById(userId, {
//       skills: normalized,
//     });

//     if (!updated) {
//       return res.status(400).json({ message: 'Update failed' });
//     }

//     return res.json({
//       message: 'Skills updated successfully',
//       updated,
//     });
//   } catch (err) {
//     return res.status(500).json({ message: 'Internal server error', err });
//   }
// };

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

export const addSkill = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { name, level } = req.body;
  const skills = await userService.addSkill(userId, name, level ?? 'beginner');
  return res.status(201).json({ success: true, skills });
};

export const removeSkill = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { key } = req.params;
  const skills = await userService.removeSkill(userId, key);
  return res.status(200).json({ success: true, skills });
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
