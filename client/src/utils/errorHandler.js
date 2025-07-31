
// Utility function to handle async actions and errors consistently
export const handleAsyncRequest = async (asyncFunc, args = [], rejectWithValue) => {
    try {
      // Execute the async function (e.g., API call)
      return await asyncFunc(...args);
    } catch (error) {
      // Log the error (optional, for debugging purposes)
      console.error("Error occurred in async function:", error);
      
      // Handle the error and return the rejection message
      return handleApiError(error, rejectWithValue);
    }
  };
  
  // Centralized error handler function
  export const handleApiError = (error, rejectWithValue) => {
    // If the error has a response from the server
    if (error.response) {
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          return rejectWithValue({ message: "Unauthorized access!" });
        case 404:
          return rejectWithValue({ message: "Resource not found!" });
        case 500:
          return rejectWithValue({ message: "Internal Server Error. Please try again later." });
        default:
          return rejectWithValue({ message: error.response?.data?.message || "An error occurred!" });
      }
    } 
    // If the error has a request but no response (e.g., network issues)
    else if (error.request) {
      if (error.message.includes("Network Error")) {
        return rejectWithValue({
          message: "Unable to connect to the server. Please check your network connection.",
        });
      }
      if (error.code === "ECONNABORTED") {
        return rejectWithValue({
          message: "The request timed out. Please try again later.",
        });
      }
    } 
    // If the error doesn't match the above cases (unknown error)
    else {
      return rejectWithValue({
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };
  
  // Timeout function that returns a rejected promise after a set time
  export const timeout = (ms) =>
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    );
  