'use client';

import { useState } from 'react';
import SkillEditor from '@/components/SkillEditor';
import { updateProfile } from '@/services/userService';
import { motion } from 'framer-motion';
import { fadeUp, slideIn } from '@/lib/motion';

import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export interface Skill {
  key: string;
  label: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Connection {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface UserProfile {
  user: string;
  fullName: string;
  email: string;
  jobTitle?: string;
  linkedinId?: string;
  age?: number;
  sex?: string;
  profilePicture?: string;
  skills?: Skill[];
  connections?: Connection[];
}

interface ProfilePageProps {
  user: UserProfile;
}

interface InputProps {
  label: string;
  value?: string | number;
  editable?: boolean;
  onChange?: (v: string) => void;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftUser, setDraftUser] = useState<UserProfile>(user);
  const [skills, setSkills] = useState<Skill[]>(user.skills ?? []);

  const handleSave = async () => {
    try {
      const updatedUser = await updateProfile({
        jobTitle: draftUser.jobTitle,
        linkedinId: draftUser.linkedinId,
        age: draftUser.age,
        sex: draftUser.sex,
      });
      setDraftUser(prev => ({
        ...prev,
        ...updatedUser,
        skills: prev.skills,
      }));

      setIsEditing(false);
      toast.success('Your profile has been updated');
    } catch {
      toast.warning('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 px-4 py-6 sm:p-6">
      <Link href="/home" className="absolute  top-0 left-10 text-2xl">
        Go Back
      </Link>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-3xl bg-linear-to-r from-favor favor to-primary p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Image
                src={user.profilePicture ?? '/auth/girl.jpg'}
                width={80}
                height={80}
                alt="avatar"
                className="h-20 w-20 rounded-full object-cover border-4 border-white "
              />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-favor rounded-full border-4 border-white"></div>
            </div>
            <div className="text-background text-center sm:text-left">
              <h2 className="text-lg sm:text-2xl font-bold leading-tight">
                {user.fullName}
              </h2>
              <p className="text-xs sm:text-sm text-background">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-white font-medium "
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </motion.button>
            ) : (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setDraftUser(user);
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 text-white font-medium hover:bg-white/20 btn-transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-favor hover:bg-favor/80 px-6 py-3 text-white font-medium  btn-transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            variants={slideIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-5 sm:p-8 "
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="FULL NAME" value={draftUser.fullName} />
              <Input label="EMAIL ADDRESS" value={draftUser.email} />
              <Input
                label="JOB TITLE"
                value={draftUser.jobTitle}
                editable={isEditing}
                onChange={v => setDraftUser(prev => ({ ...prev, jobTitle: v }))}
              />
              <Input
                label="LINKEDIN ID"
                value={draftUser.linkedinId}
                editable={isEditing}
                onChange={v =>
                  setDraftUser(prev => ({ ...prev, linkedinId: v }))
                }
              />
              <Input
                label="AGE"
                value={draftUser.age}
                editable={isEditing}
                onChange={v =>
                  setDraftUser(prev => ({
                    ...prev,
                    age: Number(v),
                  }))
                }
              />

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 tracking-wide">
                  SEX
                </label>
                {isEditing ? (
                  <select
                    value={draftUser.sex ?? ''}
                    onChange={e =>
                      setDraftUser(prev => ({ ...prev, sex: e.target.value }))
                    }
                    className="w-full rounded-xl border-2 border-gray-200 bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:primary/50 transition-all"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <input
                    value={draftUser.sex ?? ''}
                    disabled
                    className="w-full rounded-xl bg-gray-50 px-4 py-3 text-sm text-foreground border-2 border-transparent"
                  />
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={slideIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl lg:w-132 p-5 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Skills & Expertise
              </h3>
            </div>

            {!isEditing && skills.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {skills.map((skill, index) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={`${skill.label}-${skill.level}`}
                    className="px-4 py-2 bg-linear-to-r from-gray-100 to-gray-50 rounded-full text-sm font-medium text-foreground border"
                  >
                    <span className="flex items-center gap-2">
                      {getLevelIcon(skill.level)}
                      {skill.label}
                      <span className="text-xs text-gray-500">
                        ({skill.level})
                      </span>
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {isEditing && (
              <SkillEditor
                initialSkills={skills}
                editable={isEditing}
                onSkillsChange={setSkills}
              />
            )}

            {!isEditing && skills.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                Click &quot;Edit Profile&quot; to add your skills.
              </p>
            )}
          </motion.div>
        </div>

        <div className="space-y-6 lg:mt-0 mt-2">
          <motion.div
            variants={slideIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-5 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Quick Stats</h3>
            </div>

            <div className="space-y-4">
              <StatRow label="Skills" value={skills.length} />
              <StatRow
                label="Connections"
                value={user.connections?.length ?? 0}
              />
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Profile Complete
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {calculateProfileCompletion(draftUser, skills)}%
                  </span>
                </div>
                <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                    style={{
                      width: `${calculateProfileCompletion(draftUser, skills)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={slideIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="
    bg-linear-to-br from-yellow-50 to-orange-50
    rounded-3xl
    p-5 sm:p-8
    border border-yellow-100
  "
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="text-xl sm:text-2xl">💡</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Profile Tips
              </h3>
            </div>

            <ul className="space-y-3 sm:space-y-4">
              <TipItem text="Add more skills to increase visibility" />
              <TipItem text="Connect your LinkedIn for credibility" />
              <TipItem text="Upload a professional photo" />
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, editable, onChange }: InputProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-2 tracking-wide">
        {label}
      </label>
      <input
        value={value ?? ''}
        disabled={!editable}
        onChange={e => onChange?.(e.target.value)}
        className={`w-full rounded-xl px-4 py-3 text-sm transition-all ${
          editable
            ? 'border-2 border-gray-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
            : 'bg-gray-50 text-foreground border-2 border-transparent'
        }`}
      />
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-xl sm:text-2xl font-bold text-gray-800">
        {value}
      </span>
    </div>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0"></div>
      <span className="text-sm text-foreground">{text}</span>
    </li>
  );
}

function getLevelIcon(level: string) {
  switch (level) {
    case 'beginner':
      return (
        <svg
          className="w-4 h-4 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    case 'intermediate':
      return (
        <svg
          className="w-4 h-4 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    case 'advanced':
      return (
        <svg
          className="w-4 h-4 text-orange-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    default:
      return null;
  }
}

function calculateProfileCompletion(
  user: UserProfile,
  skills: Skill[]
): number {
  let completion = 0;
  const fields = [
    user.fullName,
    user.email,
    user.jobTitle,
    user.linkedinId,
    user.age,
    user.sex,
    user.profilePicture,
  ];

  fields.forEach(field => {
    if (field) completion += 10;
  });

  if (skills.length > 0) completion += 15;
  if (skills.length >= 3) completion += 15;

  return Math.min(completion, 100);
}
