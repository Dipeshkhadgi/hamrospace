import express from 'express';
import { addPost, addUpdateComment, deleteComment, deletePost, editPost, getMyPosts, likeAndUnlikePost, postOfFollowing } from '../../controllers/postController/PostController.js';
import { isAuthenticated } from '../../middlewares/auth.js';
import { postImageUpload } from '../../file/multer.js';
const router = express.Router();

//create Post;
router.route("/add-post").post(isAuthenticated, postImageUpload, addPost);
router.route("/edit-post/:id").put(isAuthenticated, postImageUpload, editPost);
router.route("/post-like-unlike/:id").get(isAuthenticated,likeAndUnlikePost)
router.route("/add-update-comment/:id").put(isAuthenticated, addUpdateComment);
router.route("/delete-comment/:id").delete(isAuthenticated, deleteComment);

//getPostOfFollowing
router.route("/followers-posts").get(isAuthenticated,postOfFollowing)

router.route("/delete-post/:id").delete(isAuthenticated, deletePost);
router.route("/my-posts").get(isAuthenticated, getMyPosts);



export default router;