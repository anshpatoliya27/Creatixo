import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_API_SECRET
});

console.log('Cloudinary config loaded:', {
  cloud_name: cloudinary.config().cloud_name ? 'set' : 'missing',
  api_key: cloudinary.config().api_key ? 'set' : 'missing'
});

export default cloudinary;