'use client';

import { useState } from 'react';
import SkillEditor from '@/components/SkillEditor';
import { updateProfile } from '@/services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, slideIn } from '@/lib/motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { axiosInstance } from '@/lib/axiosInstance';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Mail,
  Briefcase,
  Linkedin,
  Calendar,
  User,
  Edit3,
  Check,
  LogOut,
  Lightbulb,
  Users,
  Star,
  Plus,
  X,
  ChevronLeft,
} from 'lucide-react';
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
  icon?: React.ReactNode;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftUser, setDraftUser] = useState<UserProfile>(user);
  const [skills, setSkills] = useState<Skill[]>(user.skills ?? []);
  const [savedUser, setSavedUser] = useState<UserProfile>(user);
  const [savedSkills, setSavedSkills] = useState<Skill[]>(user.skills ?? []);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  const handleAvatarChange = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/avatar`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      setDraftUser(prev => ({
        ...prev,
        profilePicture: data.url,
      }));

      setSavedUser(prev => ({
        ...prev,
        profilePicture: data.url,
      }));

      toast.success('Profile picture updated');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      toast.success('Logged out');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const handleSave = async () => {
    try {
      const updatedUser = await updateProfile({
        jobTitle: draftUser.jobTitle,
        linkedinId: draftUser.linkedinId,
        age: draftUser.age,
        sex: draftUser.sex,
      });

      const newSavedUser = {
        ...draftUser,
        ...updatedUser,
        skills: skills,
      };

      setDraftUser(newSavedUser);
      setSavedUser(newSavedUser);
      setSavedSkills(skills);

      setIsEditing(false);
      toast.success('Your profile has been updated');
    } catch {
      toast.warning('Something went wrong');
    }
  };

  const handleCancel = () => {
    setDraftUser(savedUser);
    setSkills(savedSkills);
    setIsEditing(false);
  };

  const completion = calculateProfileCompletion(savedUser, savedSkills);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-emerald-50/20 to-slate-50 px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-12">
      <Link
        href="/home"
        className="absolute top-7 left-10 flex  font-semibold text-primary"
      >
        {' '}
        <ChevronLeft size={23} className="mt-0.5" />
        Go Back
      </Link>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 md:mb-12"
        >
          {/* Profile Header */}
          <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="relative h-32 sm:h-40 md:h-48 bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-600">
              <div className="absolute inset-0 bg-[radial-linear(circle_at_top_right,var(--tw-linear-stops))] from-white/10 via-transparent to-transparent"></div>
            </div>

            <div className="relative px-5 sm:px-6 md:px-8 pb-6 md:pb-8">
              {/* Avatar */}
              <div className="relative -mt-12 sm:-mt-14 md:-mt-16 mb-4 md:mb-6">
                <div className="relative inline-block group">
                  <div className="relative">
                    <Image
                      src={'/auth/img1.jpg'}
                      width={128}
                      height={128}
                      alt="avatar"
                      className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full object-cover border-4 border-white shadow-lg ring-1 ring-slate-200/50"
                    />

                    <label className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Camera className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1" />
                        <p className="text-[10px] md:text-xs font-medium">
                          Change
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarChange(file);
                        }}
                      />
                    </label>

                    {uploading && (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm"></div>
                </div>
              </div>

              {/* User Info & Actions */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-900 mb-1 truncate">
                    {draftUser.fullName}
                  </h1>
                  <p className="text-base md:text-lg text-slate-600 mb-3 md:mb-4 truncate">
                    {draftUser.jobTitle || 'Professional'}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate max-w-50 sm:max-w-none">
                        {draftUser.email}
                      </span>
                    </div>
                    {draftUser.linkedinId && (
                      <div className="flex items-center gap-1.5">
                        <Linkedin className="w-4 h-4 text-slate-400" />
                        <span>LinkedIn</span>
                      </div>
                    )}
                    {draftUser.age && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{draftUser.age} years</span>
                      </div>
                    )}
                  </div>

                  {/* Profile Completion */}
                  <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-medium text-slate-700">
                        {completion}% Complete
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <AnimatePresence mode="wait">
                    {!isEditing ? (
                      <motion.div
                        key="view-mode"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <button
                          onClick={handleLogout}
                          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Logout"
                        >
                          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                        </button>

                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 md:px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit Profile</span>
                          <span className="sm:hidden">Edit</span>
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="edit-mode"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 md:px-5 py-2.5 text-slate-700 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>

                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 md:px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Personal Information */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="bg-white border border-slate-200/60 rounded-2xl p-6 md:p-8 shadow-sm"
            >
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-6">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                <Input
                  label="Full Name"
                  value={draftUser.fullName}
                  icon={<User className="w-4 h-4 text-slate-400" />}
                />
                <Input
                  label="Email"
                  value={draftUser.email}
                  icon={<Mail className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="Job Title"
                  value={draftUser.jobTitle}
                  editable={isEditing}
                  onChange={v =>
                    setDraftUser(prev => ({ ...prev, jobTitle: v }))
                  }
                  icon={<Briefcase className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="LinkedIn"
                  value={draftUser.linkedinId}
                  editable={isEditing}
                  onChange={v =>
                    setDraftUser(prev => ({ ...prev, linkedinId: v }))
                  }
                  icon={<Linkedin className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="Age"
                  value={draftUser.age}
                  editable={isEditing}
                  onChange={v =>
                    setDraftUser(prev => ({ ...prev, age: Number(v) }))
                  }
                  icon={<Calendar className="w-4 h-4 text-slate-400" />}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gender
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    {isEditing ? (
                      <select
                        value={draftUser.sex ?? ''}
                        onChange={e =>
                          setDraftUser(prev => ({
                            ...prev,
                            sex: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <input
                        value={draftUser.sex ?? 'Not specified'}
                        disabled
                        className="w-full rounded-lg bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-600"
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Skills & Expertise */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="bg-white border border-slate-200/60 rounded-2xl p-6 md:p-8 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                    Skills & Expertise
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {skills.length} skill{skills.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {!isEditing && skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      key={`${skill.label}-${skill.level}`}
                    >
                      <div
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${getSkillStyle(
                          skill.level
                        )}`}
                      >
                        {skill.label}
                      </div>
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
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    No skills added
                  </p>
                  <p className="text-xs text-slate-500">
                    Edit your profile to add skills
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Stats & Insights */}
          <div className="space-y-6 md:space-y-8">
            {/* Quick Stats */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900 mb-5">
                Overview
              </h3>

              <div className="space-y-4">
                <StatRow
                  label="Skills"
                  value={savedSkills.length}
                  icon={<Lightbulb className="w-4 h-4 text-emerald-600" />}
                />
                <StatRow
                  label="Connections"
                  value={savedUser.connections?.length ?? 0}
                  icon={<Users className="w-4 h-4 text-blue-600" />}
                />
                <StatRow
                  label="Advanced"
                  value={savedSkills.filter(s => s.level === 'advanced').length}
                  icon={<Star className="w-4 h-4 text-amber-500" />}
                />
              </div>
            </motion.div>

            {/* Profile Insights */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-6"
            >
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Profile Tips
              </h3>

              <ul className="space-y-3">
                <TipItem
                  text="Add at least 3 skills"
                  completed={savedSkills.length >= 3}
                />
                <TipItem
                  text="Connect LinkedIn"
                  completed={!!savedUser.linkedinId}
                />
                <TipItem
                  text="Upload a photo"
                  completed={!!savedUser.profilePicture}
                />
                <TipItem
                  text="Complete profile info"
                  completed={completion === 100}
                />
              </ul>
            </motion.div>

            {/* Achievement */}
            {completion === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-900 text-white rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold mb-1">
                  Profile Complete!
                </h3>
                <p className="text-sm text-slate-300">Your profile is ready</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Helper Components ---------- */

function Input({ label, value, editable, onChange, icon }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          value={value ?? ''}
          disabled={!editable}
          onChange={e => onChange?.(e.target.value)}
          className={`w-full rounded-lg ${icon ? 'pl-10 pr-4' : 'px-4'
            } py-2.5 text-sm transition-all ${editable
              ? 'border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              : 'bg-slate-50 text-slate-600 border border-slate-200 cursor-not-allowed'
            }`}
        />
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2.5">
        {icon && <div className="shrink-0">{icon}</div>}
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className="text-lg font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function TipItem({ text, completed }: { text: string; completed?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <div
        className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${completed ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'
          }`}
      >
        {completed && <Check className="w-3 h-3 text-white" />}
      </div>
      <span
        className={`text-sm ${completed
          ? 'text-slate-500 line-through'
          : 'text-slate-700 font-medium'
          }`}
      >
        {text}
      </span>
    </li>
  );
}

function getSkillStyle(level: Skill['level']) {
  switch (level) {
    case 'beginner':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    case 'intermediate':
      return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    case 'advanced':
      return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
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
