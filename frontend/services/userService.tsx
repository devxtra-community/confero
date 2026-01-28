import { UserProfile } from '@/components/ProfilePage';
import { axiosInstance } from '@/lib/axiosInstance';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SkillInput {
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

export const updateUserSkills = async (skills: SkillInput[]) => {
  const res = await axiosInstance.patch('/users/me/skills', {
    skills,
  });
  console.log(res);
  return res.data;
};

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  const res = await axiosInstance.patch('/users/update-profile', payload);
  return res.data.user;
}
