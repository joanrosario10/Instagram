import { Cloudinary } from "@cloudinary/url-gen";
import { upload } from "cloudinary-react-native";
import {
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary-react-native/lib/typescript/src/api/upload/model/params/upload-params";

// Ensure these environment variables are properly set in your project
const CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "your_cloud_name";
const UPLOAD_PRESET = "Default"; // Make sure this preset exists in your Cloudinary dashboard

// Create a Cloudinary instance and set your cloud name.
export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUD_NAME,
  },
});

export const uploadImage = async (file: string) => {
  const options: UploadApiOptions = {
    upload_preset: UPLOAD_PRESET,
    unsigned: true, // Make sure your preset allows unsigned uploads
    resource_type: "auto",
  };

  return new Promise<UploadApiResponse>((resolve, reject) => {
    // Upload the image to Cloudinary
    upload(cld, {
      file,
      options: options,
      callback: (error, response) => {
        if (error || !response) {
          reject(error || new Error("Upload failed"));
        } else {
          resolve(response);
        }
      },
    });
  });
};
