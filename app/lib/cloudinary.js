import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

export const uploadToCloudinary = async (file, userId, fileName) => {
  if (!file) return null;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

  // Upload with a user-specific folder and custom filename
  const uploadResponse = await cloudinary.uploader.upload(base64Image, {
    folder: `pgp_chat/${userId}`,
    public_id: fileName, // Custom file name
    overwrite: true, // Replaces existing file with the same name
  });

  return uploadResponse.secure_url;
};

// export const uploadToCloudinary = async (file, userId) => {
//   if (!file) return null;

//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

//   // Upload to Cloudinary under user-specific folder
//   const uploadResponse = await cloudinary.v2.uploader.upload(base64Image, {
//     folder: `users/${userId}`, // Creates a folder for each user
//   });

//   return uploadResponse.secure_url;
// };

// export const uploadToCloudinary = async (file) => {
//   if (!file) return null;

//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

//   const uploadResponse = await cloudinary.v2.uploader.upload(base64Image, {
//     folder: "your-folder-name", // Change this to your desired Cloudinary folder
//   });

//   return uploadResponse.secure_url;
// };

// export default async function handler(req, res) {   // It's the code of an api to upload image. Customize to use with server components directly!
//   if (req.method === 'POST') {
//     const { fileName, fileType } = req.body;
//     const timestamp = Math.floor(Date.now() / 1000);

//     const signature = cloudinary.utils.api_sign_request(
//       {
//         file: fileName,
//         resource_type: 'auto', // This can be 'image', 'video', etc.
//         type: 'upload',
//         timestamp: timestamp,
//       },
//       process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
//     );

//     res.status(200).json({
//       signature,
//       apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
//       cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
//       timestamp,
//       fileName,
//       fileType,
//     });
//   }
// }
