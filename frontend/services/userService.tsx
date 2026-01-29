import { UserProfile } from '@/components/ProfilePage';
import { axiosInstance } from '@/lib/axiosInstance';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Skill {
  key: string;
  label: string;
  level: SkillLevel;
}

export type UpdateProfilePayload = {
  username?: string;
  jobTitle?: string;
  linkedinId?: string;
  age?: number;
  sex?: string;
};

export async function addSkill(
  label: string,
  level: SkillLevel
): Promise<Skill[]> {
  const res = await axiosInstance.post('/users/me/skills', {
    name: label,
    level,
  });
  return res.data.skills;
}

export async function removeSkill(key: string): Promise<Skill[]> {
  const res = await axiosInstance.delete(`/users/me/skills/${key}`);
  return res.data.skills;
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  const res = await axiosInstance.patch('/users/update-profile', payload);
  return res.data.user;
}
