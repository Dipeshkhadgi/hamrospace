import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { handleAsyncRequest } from "../../../utils/errorHandler";
import API from "../../api/api";

/**
 * @typedef {Object} ChatState
 * @property {boolean} loading 
 * @property {boolean} isLoading 
 * @property {boolean} isProcessing
 * @property {null} isError 
 * @property {null} error 
 * @property {string} message 
 * @property {Array | null} notifications
 * @property {Object | null} friendState
/**
 * @type {ChatState}
 */
//getFollowingPost
export const getNotifications = createAsyncThunk(
  "post-getNotifications",
  async (__, { rejectWithValue }) => {
    const getNotificationsFunc = async () => {
      const response = await API.get(`/notifications`);
      return response.data;
    };

    return handleAsyncRequest(getNotificationsFunc, [], rejectWithValue);
  }
);

//acceptFriendRequest 
export const acceptFriendRequest = createAsyncThunk(
  "post-acceptFriendRequest",
  async ({data,toast}, { rejectWithValue }) => {
    const acceptFriendRequestFunc = async () => {
      const response = await API.put(`/accept-friend-request`,data);
      toast.success(response.data.message || "friend request accepted!")
      return response.data;
    };

    return handleAsyncRequest(acceptFriendRequestFunc, [], rejectWithValue);
  }
);

const initialState = {
  loading: false,
  isLoading: false,
  isProcessing: false,
  error: null,
  isError: null,
  message: "",
  notifications:[],
  friendState:null,

};
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    /**
     * @param {ChatState} state
     */

    clearChatError: (state) => {
      state.error = null;
      state.isError = null;
    },

  },
  extraReducers: (builder) => {
    builder

    .addCase(getNotifications.pending,(state)=>{
      state.isLoading = true;
    })
    .addCase(getNotifications.fulfilled,(state,action)=>{
      state.isLoading = false;
      state.notifications = action.payload.data;
    })
    .addCase(getNotifications.rejected,(state,action)=>{
      state.isLoading = false;
      state.error = action.payload.message;
    })
    .addCase(acceptFriendRequest.pending,(state)=>{
      state.loading = true;
    })
    .addCase(acceptFriendRequest.fulfilled,(state,action)=>{
      state.loading = false;
      state.friendState = action.payload.senderId;
    })
    .addCase(acceptFriendRequest.rejected,(state,action)=>{
      state.loading = false;
      state.isError = action.payload.message;
    })
   
  },
});

export const { clearChatError} = chatSlice.actions;

export default chatSlice.reducer;