import { streamUpload } from "../../helpers/fileConvert.js";
import { tryCatchAsyncError } from "../../middlewares/tryCatchHandler.js";
import Post from "../../models/postModel/post.js";
import User from "../../models/userModel/user.js";
import ErrorHandler from "../../utils/errorHandler.js";
import sharp from "sharp";
import cloudinary from "cloudinary";

// Create Post with WebP conversion and upload to Cloudinary
export const addPost = tryCatchAsyncError(async (req, res, next) => {
  if (!req.body.caption)
    return next(new ErrorHandler("Please enter a caption.", 400));

  // Check if an image is provided
  if (!req.file) return next(new ErrorHandler("Please upload an image.", 400));

  // Convert image to WebP using sharp
  let webpBuffer;
  try {
    webpBuffer = await sharp(req.file.buffer).webp({ quality: 80 }).toBuffer();
  } catch (error) {
    return next(new ErrorHandler("Error converting image to WebP.", 500));
  }

  // Upload WebP image to Cloudinary
  const result = await streamUpload(webpBuffer);

  // Create new post data with the image URL
  const newPostData = {
    caption: req.body.caption,
    postImg: {
      url: result.secure_url,
      public_id: result.public_id,
    },
    owner: req.user.id,
  };

  // Create a new post in the database
  const newPost = await Post.create(newPostData);

  const user = await User.findById(req.user.id);
  user.posts.unshift(newPost._id);

  await user.save();

  res.status(201).json({
    success: true,
    data: newPost,
  });
});

//update Post
export const editPost = tryCatchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ErrorHandler("Post not found", 404));

  // Check if the user is authorized to update the post
  if (post.owner.toString() !== req.user.id.toString()) {
    return next(new ErrorHandler("Unauthorized", 403));
  }

  if (!req.body.caption) {
    return next(new ErrorHandler("Please enter a caption.", 400));
  }

  let newPostData = { caption: req.body.caption };

  // Check if a new image is uploaded
  if (req.file) {
    // Convert image to WebP using sharp
    let webpBuffer;
    try {
      webpBuffer = await sharp(req.file.buffer)
        .webp({ quality: 80 })
        .toBuffer();
    } catch (error) {
      return next(new ErrorHandler("Error converting image to WebP.", 500));
    }

    // Upload WebP image to Cloudinary
    const result = await streamUpload(webpBuffer);

    // Update new image details in post data
    newPostData.postImg = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    // Delete the previous image from Cloudinary if it exists
    if (post.postImg && post.postImg.public_id) {
      try {
        await cloudinary.v2.uploader.destroy(post.postImg.public_id);
      } catch (error) {
        return next(
          new ErrorHandler(
            "Failed to delete previous image from Cloudinary",
            500
          )
        );
      }
    }
  }

  // Update the post in the database
  Object.assign(post, newPostData);
  await post.save();

  res.status(200).json({
    success: true,
    message: "Post updated successfully",
    data: post,
  });
});

//delete Post
export const deletePost = tryCatchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) return next(new ErrorHandler("Post not found", 404));

  if (post.owner.toString() !== req.user.id.toString())
    return next(new ErrorHandler("Not authorized to delete this post", 401));

  // Destroy the image from Cloudinary
  if (post.postImg && post.postImg.public_id) {
    await cloudinary.v2.uploader.destroy(
      post.postImg.public_id,
      (error, result) => {
        if (error)
          return next(
            new ErrorHandler("Failed to delete image from Cloudinary", 500)
          );
      }
    );
  }

  // Delete the post from the database
  await post.deleteOne();

  // Remove the post from the user's post list
  const user = await User.findById(req.user.id);
  const index = user.posts.indexOf(req.params.id);
  if (index > -1) {
    user.posts.splice(index, 1);
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});

//get my Posts
export const getMyPosts = tryCatchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const posts = [];
  for (let i = 0; i < user.posts.length; i++) {
    const post = await Post.findById(user.posts[i]).populate(
      "likes comments.user owner"
    );
    posts.push(post);
  }

  res.status(200).json({
    success: true,
    data: posts,
  });
});

//like and unlike Post
export const likeAndUnlikePost = tryCatchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ErrorHandler("post not found", 404));
  if (post.likes.includes(req.user.id)) {
    const index = post.likes.indexOf(req.user.id);
    post.likes.splice(index, 1);

    await post.save();
    res.status(200).json({
      success: true,
      message: "Post Unliked",
    });
  } else {
    post.likes.push(req.user.id);
    await post.save();

    res.status(200).json({
      success: true,
      message: "post Liked!",
    });
  }
});

//addUpdateComment
export const addUpdateComment = tryCatchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new ErrorHandler("Post not found", 404));

  const commentIndex = post.comments.findIndex(
    (item) => item.user.toString() === req.user.id.toString()
  );
  if (commentIndex !== -1) {
    post.comments[commentIndex].comment = req.body.comment;
  } else {
    post.comments.push({
      user: req.user.id,
      comment: req.body.comment,
    });
  }

  await post.save();
  res.status(200).json({
    success: true,
    message: commentIndex !== -1 ? "Comment updated" : "Comment added!",
  });
});
//deleteComment
export const deleteComment = tryCatchAsyncError(async(req,res,next)=>{
  const post = await Post.findById(req.params.id)
  if(!post) return next(new ErrorHandler("Post not found!",404))
    if(post.owner.toString() === req.user.id.toString()){
      if(req.body.commentId == undefined){
        return res.status(400).json({
          success:false,
          message:"CommentId is required!"
        })
      }
      post.comments.forEach((item,index)=>{
        if(item._id.toString() === req.body.commentId.toString()){
          return post.comments.splice(index,1)
        }
      })
      await post.save()
      return res.status(200).json({
        success:true,
        message:"selected comment deleted!"
      })
    }else{
      post.comments.forEach((item,index)=>{
        if(item.user.toString() === req.user.id.toString()){
          return post.comments.splice(index,1)
        }
      })
      await post.save()
      return res.status(200).json({
        success:true,
        message:"Comment remove"
      })
    }
})

//get PostOF Following
export const postOfFollowing = tryCatchAsyncError(async(req,res,next)=>{
  const user = await User.findById(req.user.id)
  if(!user) return next(new ErrorHandler("user not found!",404))

    const posts = await Post.find({
      owner:{
        $in:user.following,
      }
    }).populate("owner likes comments.user")
    res.status(200).json({
      success:true,
      data:posts.reverse(),
    })
})