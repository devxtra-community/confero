import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'user' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'deleted';
export interface IUser extends Document {
  email: string;
  password: string;

  firstName: string;
  lastName?: string;
  displayName?: string;

  role: UserRole;
  accountStatus: AccountStatus;

  jobTitle?: string;
  linkedinId?: string;

  profilePicture?: string;
  skills: string[];
  interests: string[];

  availableForCall: boolean;
  lastActiveAt: Date;

  lastLoginAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },

    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    displayName: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },

    jobTitle: {
      type: String,
      trim: true,
      default: '',
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
      type: [String],
      default: [],
    },

    interests: {
      type: [String],
      default: [],
    },

    availableForCall: {
      type: Boolean,
      default: false,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ skills: 1 });
userSchema.index({ availableForCall: 1 });

export const UserModel = mongoose.model<IUser>('User', userSchema);
