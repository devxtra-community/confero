import { Request, Response } from 'express';
import { UserModel } from '../models/userModel.js';

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

    // ✅ handle string (suggestions)
    if (typeof skill === 'string') {
      name = skill;
    }
    // ✅ handle object (typed)
    else if (typeof skill === 'object' && skill.name) {
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
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', err });
  }
};
