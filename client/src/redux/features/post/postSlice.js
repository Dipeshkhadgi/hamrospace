import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { handleAsyncRequest } from "../../../utils/errorHandler";
import API from "../../api/api";

/**
 * @typedef {Object} PostState
 * @property {boolean} loading 
 * @property {boolean} isLoading 
 * @property {boolean} isProcessing
 * @property {null} isError 
 * @property {null} error 
 * @property {string} message 
 * @property {Object | null} post
 * @property {Array | null} followingPosts
 * 
/**
 * @type {PostState}
 */

//register
export const createPost = createAsyncThunk(
  "post-createPost",
  async ({ formData, toast, navigate }, { rejectWithValue }) => {
  
    const addPostFunc = async () => {
      const response = await API.post(`/add-post`, formData);
      toast.success(response.data.message || "post added success!");
      navigate("/");
      return response.data;
    };

    return handleAsyncRequest(addPostFunc, [], rejectWithValue);
  }
);

//getFollowingPost
export const getFollowingPosts = createAsyncThunk(
  "post-getFollowingPosts",
  async (__, { rejectWithValue }) => {
    const getFollowingPostsFunc = async () => {
      const response = await API.get(`/followers-posts`);
      return response.data;
    };

    return handleAsyncRequest(getFollowingPostsFunc, [], rejectWithValue);
  }
);

const initialState = {

  loading: false,
  isLoading: false,
  isProcessing: false,
  error: null,
  isError: null,
  message: "",
  post:null,
  followingPosts:[]

};
const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    /**
     * @param {PostState} state
     */

    clearPostError: (state) => {
      state.error = null;
      state.isError = null;
    },

  },
  extraReducers: (builder) => {
    builder
    .addCase(createPost.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(createPost.fulfilled, (state,action) => {
      state.isLoading = false;
      state.post = action.payload;
    })
    .addCase(createPost.rejected, (state,action) => {
      state.isLoading = false;
      state.error = action.payload.message;
    })
    .addCase(getFollowingPosts.pending,(state)=>{
      state.isLoading = true;
    })
    .addCase(getFollowingPosts.fulfilled,(state,action)=>{
      state.isLoading = false;
      state.followingPosts = action.payload.data;
    })
    .addCase(getFollowingPosts.rejected,(state,action)=>{
      state.isLoading = false;
      state.error = action.payload.message;
    })
   
  },
});

export const { clearPostError } = postSlice.actions;

export default postSlice.reducer;