import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { handleAsyncRequest } from "../../../utils/errorHandler";
import API from "../../api/api";

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated 
 * @property {boolean} adminRoute 
 * @property {boolean} loading 
 * @property {boolean} isLoading 
 * @property {boolean} isProcessing
 * @property {null} isError 
 * @property {null} error 
 * @property {string} message 
 * @property {Object | null} user 
 * @property {Object | null} friendRequest 
 * @property {Array | null} allUsers 
/**
 * @type {AuthState}
 */

//register
export const register = createAsyncThunk(
  "/auth-register",
  async ({ registerData, toast, navigate }, { rejectWithValue }) => {
    const registerFunc = async () => {
      const response = await API.post(`/register`, registerData);
      toast.success(response.data.message || "Auth register success!");
      navigate("/verify-account");
      return response.data;
    };

    return handleAsyncRequest(registerFunc, [], rejectWithValue);
  }
);

//verifyAccount
export const verifyAccount = createAsyncThunk(
  "/auth-verifyAccount",
  async ({ verifyAccountValue, toast, navigate }, { rejectWithValue }) => {
    const verifyAccountFunc = async () => {
      const response = await API.post(`/verify-account`, verifyAccountValue);
      toast.success(response.data.message || "OTP verified success!");
      navigate("/login");
      return response.data;
    };

    return handleAsyncRequest(verifyAccountFunc, [], rejectWithValue);
  }
);

//resendOTP
export const resendOTP = createAsyncThunk(
  "/auth-resendOTP",
  async ({ resendOTPValue, toast }, { rejectWithValue }) => {
    const resendOTPFunc = async () => {
      const response = await API.post(`/resend-otp`, resendOTPValue);
      toast.success(response.data.message || "OTP sent successFully!");
      return response.data;
    };

    return handleAsyncRequest(resendOTPFunc, [], rejectWithValue);
  }
);

//login
export const login = createAsyncThunk(
  "/auth-login",
  async ({ loginData, toast, navigate }, { rejectWithValue }) => {
    const loginFunc = async () => {
      const response = await API.post(`/login`, loginData);
      toast.success(response.data.message || "Auth login success!");
      navigate("/");
      return response.data;
    };

    return handleAsyncRequest(loginFunc, [], rejectWithValue);
  }
);

//forgot password
export const forgotPassword = createAsyncThunk(
  "/auth-forgotPassword",
  async ({ forgotData, toast, navigate }, { rejectWithValue }) => {
    const forgotFunc = async () => {
      const response = await API.post(`/forgot-password`, forgotData);
      toast.success(response.data.message || "OTP sent tp your email!");
      navigate("/verify-reset-password");
      return response.data;
    };

    return handleAsyncRequest(forgotFunc, [], rejectWithValue);
  }
);
//verify Reset OTP
export const resetOTPVerify = createAsyncThunk(
  "/auth-resetOTPVerify",
  async ({ resetOTPValue, toast, navigate }, { rejectWithValue }) => {
    const resetVerifyFunc = async () => {
      const response = await API.post(
        `/reset-verify-OTP-account`,
        resetOTPValue
      );
      toast.success(response.data.message || "OTP verified success!");
      navigate("/reset-password");
      return response.data;
    };

    return handleAsyncRequest(resetVerifyFunc, [], rejectWithValue);
  }
);

//resetPassword
export const resetPassword = createAsyncThunk(
  "/auth-resetPassword",
  async ({ resetData, toast, navigate }, { rejectWithValue }) => {
    const resetPasswordFunc = async () => {
      const response = await API.post(`/reset-password`, resetData);
      toast.success(response.data.message || "Password reset successFully!");
      navigate("/login");
      return response.data;
    };

    return handleAsyncRequest(resetPasswordFunc, [], rejectWithValue);
  }
);

//searchUser
export const searchUser = createAsyncThunk(
  "/auth-searchUser",
  async ({ name } = {}, { rejectWithValue }) => {
    const searchUserFunc = async () => {
      let queryParams = new URLSearchParams();
      if (name) queryParams.append("name", name);
      const response = await API.get(
        `/search-user${queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`
      );
      return response.data;
    };

    return handleAsyncRequest(searchUserFunc, [], rejectWithValue);
  }
);

//sendFriendRequest
export const sendFriendRequest = createAsyncThunk(
  "/auth-sendFriendRequest",
  async ({ data, toast }, { rejectWithValue }) => {
    const friendRequestFunc = async () => {
      const response = await API.put(`/send-friend-request`, data);
      toast.success(response.data.message || "friend request sent!");
      return response.data;
    };

    return handleAsyncRequest(friendRequestFunc, [], rejectWithValue);
  }
);

//getProfileData

export const getProfileData = createAsyncThunk(
  "auth-getProfileData",
  async (__, { rejectWithValue }) => {
    const getProfile = async () => {
      const response = await API.get(`/me`);
      return response.data;
    };

    return handleAsyncRequest(getProfile, [], rejectWithValue);
  }
);

//updateProfileAction
export const updateProfileAction = createAsyncThunk(
  "/auth-updateProfileAction",
  async ({ formData, toast }, { rejectWithValue, dispatch }) => {
    const updateProfileFunc = async () => {
      const response = await API.put(`/update-profile`, formData);
      toast.success(response.data.message || "profile update success!");
      dispatch(getProfileData())
      return response.data;
    };

    return handleAsyncRequest(updateProfileFunc, [], rejectWithValue);
  }
);


const initialState = {
  isAuthenticated: !!localStorage.getItem("AuthID"),
  adminRoute: false,
  loading: false,
  isLoading: false,
  isProcessing: false,
  loadingUserId: null,
  error: null,
  isError: null,
  message: "",
  user: null,
  allUsers: [],
  friendRequest: null,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * @param {AuthState} state
     */

    clearAuthError: (state) => {
      state.error = null;
      state.isError = null;
    },
    setLogout: (state) => {
      localStorage.removeItem("AuthID");
      state.isAuthenticated = false;
      state.adminRoute = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(verifyAccount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(verifyAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;

        const accessToken = action.payload.accessToken;
        localStorage.setItem("AuthID", accessToken);
        state.isAuthenticated = true;

        if (action.payload.data) {
          state.adminRoute = action.payload.data.role === "admin";
          state.user = action.payload.data;
        } else {
          state.adminRoute = false;
          state.user = null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(getProfileData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfileData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data

      })
      .addCase(getProfileData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message

      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(resetOTPVerify.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetOTPVerify.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
      })
      .addCase(resetOTPVerify.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(searchUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allUsers = action.payload.data;
      })
      .addCase(searchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      .addCase(sendFriendRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.friendRequest = action.payload;
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.loading = false;
        state.isError = action.payload.message;
      })
      .addCase(updateProfileAction.pending, (state) => {
        state.isLoading = true

      })
      .addCase(updateProfileAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.data

      })

      .addCase(updateProfileAction.rejected, (state, action) => {
        state.isLoading = false
        state.isError = action.payload.message

      })
  },
});

export const { clearAuthError, setLogout } = authSlice.actions;

export default authSlice.reducer;
