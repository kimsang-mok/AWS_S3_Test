import express from "express";
import cors from "cors";
import multer from "multer";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import Post from "./models/post.model.js";
import crypto from "crypto";
import dotenv from "dotenv";
import morgan from "morgan";
import sharp from "sharp";
import mongoose from "mongoose";
dotenv.config();

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const PORT = process.env.PORT || 5000;

const s3 = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  region: BUCKET_REGION,
});

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log("Cannot connect to database...", err);
  });

const app = express();
// const prisma = new PrismaClient();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
// app.use(express.json());

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

app.post("/api/posts", upload.single("image"), async (req, res) => {
  try {
    //   console.log("req.body", req.body);
    //   console.log("req.file", req.file);
    const buffer = await sharp(req.file.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer();

    const imageName = randomImageName();
    const params = {
      Bucket: BUCKET_NAME,
      Key: "tests/" + imageName,
      Body: buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    await s3.send(command);
    const post = new Post({
      caption: req.body.caption,
      photo: imageName,
    });

    const newPost = await post.save();

    res.status(201).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(400);
  }
});

app.get("/api/posts", async (req, res) => {
  const posts = await Post.find();

  for (const post of posts) {
    const GetObjectParams = {
      Bucket: BUCKET_NAME,
      Key: "tests/" + post.photo,
    };
    const command = new GetObjectCommand(GetObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    post.imageUrl = url;
  }
  res.send(posts);
});

app.delete("/api/posts/:id", async (req, res) => {
  console.log(req.params);
  const post = await Post.findById(req.params.id);
  console.log(post);
  const deleteParams = {
    Bucket: BUCKET_NAME,
    Key: "tests/" + post.photo,
  };
  const command = new DeleteObjectCommand(deleteParams);
  await s3.send(command);
  post.photo = "";
  const deletedPost = await post.save();
  res.status(200).json(deletedPost);
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
