import mongoose from 'mongoose';

export const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Mongoose connected');
  } catch (err) {
    console.log(err);
  }
};


