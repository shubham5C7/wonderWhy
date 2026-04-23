import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:8000/api/auth";

// LOGIN
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API}/login`,
        formData,
        { withCredentials: true } 
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Server error"
      );
    }
  }
);

// SIGNUP
export const signupUser = createAsyncThunk(
  "user/signupUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API}/signup`,
        formData,
        { withCredentials: true } 
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Server error"
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/check`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(null);
    }
  }
);


const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
       loading: true, 
    error: null,
  },

  reducers: {
    logout: (state) => {
      state.user = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // SIGNUP
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Inside extraReducers builder:
.addCase(fetchCurrentUser.pending, (state) => {
  state.loading = true;
})
.addCase(fetchCurrentUser.fulfilled, (state, action) => {
  state.loading = false;
  state.user = action.payload;
})
.addCase(fetchCurrentUser.rejected, (state) => {
  state.loading = false;
  state.user = null;
})

  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;