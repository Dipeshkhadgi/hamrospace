
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authSlice from "../features/auth/authSlice"
import postSlice from "../features/post/postSlice"
import chatSlice from "../features/chat/chatSlice"

// Combine reducers
const rootReducer = combineReducers({
  auth: authSlice,
  post: postSlice,
  chat:chatSlice,

});

// Configure Redux persist
const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Optimize middleware
const customizedMiddleware = (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false,
    immutableCheck: false,
  });

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: customizedMiddleware,
  devTools: process.env.NODE_ENV !== "production",
});

// Export persistor for use in the application
export const persistor = persistStore(store);
