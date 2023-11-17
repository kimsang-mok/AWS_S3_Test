import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  photo: {
    type: String,
  },
  caption: {
    type: String,
    required: true,
  },
});

const Post = mongoose.model("Post", postSchema);
export default Post;
