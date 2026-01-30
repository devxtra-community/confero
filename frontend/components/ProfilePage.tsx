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
  BarChart3,
  Plus,
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/40 px-3 py-6 sm:px-4 sm:py-8 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-6 sm:p-8 lg:p-10 shadow-2xl shadow-emerald-500/20"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-teal-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
              {/* Profile Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 flex-1">
                {/* Avatar with Upload */}
                <div className="relative group">
                  <div className="relative">
                    <Image
                      src={draftUser.profilePicture ?? '/auth/girl.jpg'}
                      width={120}
                      height={120}
                      alt="avatar"
                      className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-xl sm:rounded-2xl object-cover border-4 border-white/20 shadow-xl backdrop-blur-sm"
                    />

                    <label className="absolute inset-0 bg-black/60 rounded-xl sm:rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1" />
                        <p className="text-xs font-medium">Change</p>
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
                      <div className="absolute inset-0 bg-black/50 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-sm font-medium backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span className="text-xs">Uploading...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2.5 py-1 sm:px-3 rounded-full shadow-lg">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-gray-700">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name & Details */}
                <div className="text-white text-center sm:text-left flex-1 w-full">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-2">
                    {draftUser.fullName}
                  </h1>
                  <p className="text-emerald-100 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                    {draftUser.jobTitle || 'Professional'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-emerald-100">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="truncate max-w-[200px] sm:max-w-none">
                        {draftUser.email}
                      </span>
                    </div>
                    {draftUser.linkedinId && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>LinkedIn Connected</span>
                      </div>
                    )}
                  </div>

                  {/* Profile Completion Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 sm:gap-3 mt-4 sm:mt-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2"
                  >
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                      <svg className="transform -rotate-90 w-10 h-10 sm:w-12 sm:h-12">
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          className="text-white/20 sm:hidden"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 16}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 16 * (1 - completion / 100)
                          }`}
                          className="text-white transition-all duration-1000 sm:hidden"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-white/20 hidden sm:block"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 20}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 20 * (1 - completion / 100)
                          }`}
                          className="text-white transition-all duration-1000 hidden sm:block"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {completion}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-100">
                        Profile Complete
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {completion === 100
                          ? 'Excellent!'
                          : completion > 70
                            ? 'Almost there'
                            : 'Keep going'}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 lg:items-end w-full sm:w-auto">
                <AnimatePresence mode="wait">
                  {!isEditing ? (
                    <motion.div
                      key="view-mode"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white/90 hover:text-white border border-white/30 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditing(true)}
                        className="flex items-center justify-center gap-2 rounded-lg sm:rounded-xl bg-white text-emerald-700 px-5 sm:px-6 py-2 sm:py-2.5 font-semibold shadow-lg hover:shadow-xl hover:bg-emerald-50 transition-all w-full sm:w-auto"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="edit-mode"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto"
                    >
                      <button
                        onClick={handleCancel}
                        className="px-5 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold text-white border-2 border-white/30 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm w-full sm:w-auto"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleSave}
                        className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold bg-white text-emerald-700 rounded-lg sm:rounded-xl hover:bg-emerald-50 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                      >
                        <Check className="w-4 h-4" />
                        Save Changes
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Personal Information Card */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 sm:p-6 border-b border-emerald-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 bg-emerald-500 rounded-lg sm:rounded-xl shadow-md">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    Personal Information
                  </h3>
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Input
                    label="FULL NAME"
                    value={draftUser.fullName}
                    icon={
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    }
                  />
                  <Input
                    label="EMAIL ADDRESS"
                    value={draftUser.email}
                    icon={
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    }
                  />

                  <Input
                    label="JOB TITLE"
                    value={draftUser.jobTitle}
                    editable={isEditing}
                    onChange={v =>
                      setDraftUser(prev => ({ ...prev, jobTitle: v }))
                    }
                    icon={
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    }
                  />

                  <Input
                    label="LINKEDIN ID"
                    value={draftUser.linkedinId}
                    editable={isEditing}
                    onChange={v =>
                      setDraftUser(prev => ({ ...prev, linkedinId: v }))
                    }
                    icon={
                      <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    }
                  />

                  <Input
                    label="AGE"
                    value={draftUser.age}
                    editable={isEditing}
                    onChange={v =>
                      setDraftUser(prev => ({ ...prev, age: Number(v) }))
                    }
                    icon={
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    }
                  />

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider uppercase">
                      SEX
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
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
                          className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 bg-white pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 text-sm font-medium text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all appearance-none cursor-pointer hover:border-gray-300"
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
                          className="w-full rounded-lg sm:rounded-xl bg-gray-50 pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 text-sm font-medium text-gray-700 border-2 border-transparent"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Skills & Expertise Card */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 sm:p-6 border-b border-purple-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-2.5 bg-purple-500 rounded-lg sm:rounded-xl shadow-md">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                        Skills & Expertise
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        {skills.length} skill{skills.length !== 1 ? 's' : ''}{' '}
                        added
                      </p>
                    </div>
                  </div>
                  {/* {!isEditing && skills.length > 0 && (
                    <div className="text-xs sm:text-sm font-semibold text-purple-600 bg-purple-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      {skills.filter(s => s.level === 'advanced').length}{' '}
                      Advanced
                    </div>
                  )} */}
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                {!isEditing && skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {skills.map((skill, index) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        key={`${skill.label}-${skill.level}`}
                        className="group relative"
                      >
                        <div
                          className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold border-2 transition-all ${getSkillStyle(
                            skill.level
                          )}`}
                        >
                          <span className="flex items-center gap-1.5 sm:gap-2">
                            {getLevelIcon(skill.level)}
                            {skill.label}
                          </span>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
                          {skill.level.charAt(0).toUpperCase() +
                            skill.level.slice(1)}
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
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      No skills added yet
                    </p>
                    <p className="text-xs text-gray-400">
                      Click &quot;Edit Profile&quot; to add your skills
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Stats & Tips */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Stats Card */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-6 border-b border-blue-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 bg-blue-500 rounded-lg sm:rounded-xl shadow-md">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    Quick Stats
                  </h3>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <StatRow
                    label="Total Skills"
                    value={savedSkills.length}
                    icon={
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                    }
                  />
                  <StatRow
                    label="Connections"
                    value={savedUser.connections?.length ?? 0}
                    icon={
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    }
                  />
                  <StatRow
                    label="Advanced Skills"
                    value={
                      savedSkills.filter(s => s.level === 'advanced').length
                    }
                    icon={
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                    }
                  />
                </div>
              </div>
            </motion.div>

            {/* Profile Tips Card */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl border-2 border-amber-200/50 overflow-hidden shadow-lg"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                  <div className="text-2xl sm:text-3xl">💡</div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">
                      Profile Tips
                    </h3>
                    <p className="text-xs text-gray-600">
                      Improve your visibility
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 sm:space-y-4">
                  <TipItem
                    text="Add more skills to increase visibility"
                    completed={savedSkills.length >= 3}
                  />
                  <TipItem
                    text="Connect your LinkedIn for credibility"
                    completed={!!savedUser.linkedinId}
                  />
                  <TipItem
                    text="Upload a professional photo"
                    completed={!!savedUser.profilePicture}
                  />
                  <TipItem
                    text="Complete all personal information"
                    completed={completion === 100}
                  />
                </ul>
              </div>
            </motion.div>

            {/* Achievement Badge (if profile is complete) */}
            {/* {completion === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-white shadow-xl"
              >
                <div className="text-center">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-yellow-300" />
                  <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                    Profile Complete!
                  </h3>
                  <p className="text-xs sm:text-sm text-green-100">
                    Your profile is now ready to match with other
                    professionals
                  </p>
                </div>
              </motion.div>
            )} */}
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
      <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider uppercase">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          value={value ?? ''}
          disabled={!editable}
          onChange={e => onChange?.(e.target.value)}
          className={`w-full rounded-lg sm:rounded-xl ${
            icon ? 'pl-10 sm:pl-12 pr-3 sm:pr-4' : 'px-3 sm:px-4'
          } py-3 sm:py-3.5 text-sm font-medium transition-all ${
            editable
              ? 'border-2 border-gray-200 bg-white text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 hover:border-gray-300'
              : 'bg-gray-50 text-gray-700 border-2 border-transparent cursor-not-allowed'
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
    <div className="flex items-center justify-between py-2.5 sm:py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 sm:gap-3">
        {icon && <div className="shrink-0">{icon}</div>}
        <span className="text-xs sm:text-sm font-semibold text-gray-600">
          {label}
        </span>
      </div>
      <span className="text-xl sm:text-2xl font-bold text-gray-800">
        {value}
      </span>
    </div>
  );
}

function TipItem({ text, completed }: { text: string; completed?: boolean }) {
  return (
    <li className="flex items-start gap-2 sm:gap-3">
      <div
        className={`mt-0.5 sm:mt-1 shrink-0 ${
          completed ? 'text-green-600' : 'text-amber-500'
        }`}
      >
        {completed ? (
          <Check className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-amber-400 mt-1 sm:mt-1.5"></div>
        )}
      </div>
      <span
        className={`text-xs sm:text-sm font-medium ${
          completed ? 'text-green-700 line-through' : 'text-gray-700'
        }`}
      >
        {text}
      </span>
    </li>
  );
}

function getLevelIcon( ) {
  const iconClass = 'w-3 h-3 sm:w-4 sm:h-4';
  return <Star className={iconClass} />;
}

function getSkillStyle(level: Skill['level']) {
  switch (level) {
    case 'beginner':
      return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300';
    case 'intermediate':
      return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300';
    case 'advanced':
      return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
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
