import { Request, Response } from 'express';
import { UserModel } from '../models/userModel.js';

// 1. Put the function at the top of the file
function normalizeSkills(rawSkills: string[]) {
  const map = new Map<string, string>();

  for (const skill of rawSkills) {
    const trimmed = skill.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    const label =
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();

    map.set(key, label);
  }

  return Array.from(map.entries()).map(([key, label]) => ({
    key,
    label,
  }));
}

// 2. Your controller uses it here
export const updateSkills = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const rawSkills = req.body.skills;

  if (!Array.isArray(rawSkills)) {
    return res.status(400).json({ message: 'skills must be an array' });
  }

  const normalized = normalizeSkills(rawSkills);

  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { skills: normalized },
    { new: true }
  );

  if (!updated) {
    return res.status(400).json({ message: 'Update failed' });
  }

  return res.json({
    message: 'Skills updated successfully',
    skills: updated.skills,
  });
};
