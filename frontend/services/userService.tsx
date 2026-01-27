import { axiosInstance } from '@/lib/axiosInstance';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SkillInput {
  name: string;
  level: SkillLevel;
}

export const updateUserSkills = async (skills: SkillInput[]) => {
  const res = await axiosInstance.patch('/users/me/skills', {
    skills,
  });
  console.log(res);
  return res.data;
};
