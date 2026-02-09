import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'user' | 'admin';
export type AuthProvider = 'local' | 'google';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface IUser extends Document {
  id: string;
  email: string;
  password?: string;

  authProvider: AuthProvider;
  googleId?: string;

  fullName: string;

  age: number;
  sex: string;

  role: UserRole;

  jobTitle?: string;
  linkedinId?: string;

  profilePicture?: string;

  skills: {
    key: string;
    label: string;
    level: SkillLevel;
  }[];

  interests: string[];

  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  availableForCall: boolean;
  lastActiveAt: Date;

  lastLoginAt?: Date;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    password: {
      type: String,
    },

    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    googleId: {
      type: String,
      default: null,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      default: null,
    },

    sex: {
      type: String,
      default: '',
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    jobTitle: {
      type: String,
      default: '',
      trim: true,
    },

    linkedinId: {
      type: String,
      default: null,
    },

    profilePicture: {
      type: String,
      default: '',
    },

    skills: {
      type: [
        {
          key: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
          },
          label: {
            type: String,
            required: true,
            trim: true,
          },
          level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner',
          },
        },
      ],
      default: [],
    },

    interests: {
      type: [String],
      default: [],
    },
    resetPasswordToken: {
      type: String,
      default: false,
    },
    resetPasswordExpires: {
      type: Date,
    },

    availableForCall: {
      type: Boolean,
      default: false,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'skills.key': 1 });
userSchema.index({ availableForCall: 1 });

export const UserModel = mongoose.model<IUser>('User', userSchema);
