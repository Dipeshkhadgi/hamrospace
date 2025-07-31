import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
  },
  postImg: {
    url: {
      type: String, 
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  reels: [
    {
      title: {
        type: String,
      },
      description: {
        type: String,
      },
      video: {
        url: {
          type: String,
        },
      },
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
});

const Post = new mongoose.model("Post", postSchema);
export default Post;