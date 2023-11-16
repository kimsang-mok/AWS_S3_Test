import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  photo: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
});

const Post = mongoose.model("Post", postSchema);
export default Post;
