import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ICloudinaryResponse, IFile } from "../app/interfaces/file";

cloudinary.config({
  cloud_name: "dssytlq8z",
  api_key: "627414924843918",
  api_secret: "MhOSeFxtlyolYxxnb8OuHv_bgxI",
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },

  filename: function (req, file, cb) {
    console.log(file);
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const uploadToCloudinary = async (file: IFile): Promise<ICloudinaryResponse | undefined> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file.path, (error: Error, result: ICloudinaryResponse) => {
      fs.unlinkSync(file.path);
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
