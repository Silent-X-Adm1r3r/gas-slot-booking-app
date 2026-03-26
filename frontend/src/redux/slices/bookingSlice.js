import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/bookings', bookingData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Booking failed');
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMy',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/bookings/my', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch bookings');
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/bookings/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Booking not found');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/bookings/${id}/cancel`, { reason });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Cancellation failed');
    }
  }
);

export const rescheduleBooking = createAsyncThunk(
  'bookings/reschedule',
  async ({ id, newSlotId, providerId }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/bookings/${id}/reschedule`, { newSlotId, providerId });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Reschedule failed');
    }
  }
);

export const createPaymentIntent = createAsyncThunk(
  'bookings/createPaymentIntent',
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/payments/create-intent', { bookingId });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Payment init failed');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    list: [],
    currentBooking: null,
    newBooking: null,
    paymentData: null,
    pagination: { total: 0, page: 1, pages: 1 },
    loading: false,
    paymentLoading: false,
    error: null,
  },
  reducers: {
    clearNewBooking: (state) => {
      state.newBooking = null;
      state.paymentData = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.newBooking = action.payload.booking;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchMyBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.bookings;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.currentBooking = action.payload.booking;
      });

    builder
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const updated = action.payload.booking;
        state.list = state.list.map(b => b._id === updated._id ? updated : b);
        if (state.currentBooking?._id === updated._id) {
          state.currentBooking = updated;
        }
      });

    builder
      .addCase(rescheduleBooking.fulfilled, (state, action) => {
        const updated = action.payload.booking;
        state.list = state.list.map(b => b._id === updated._id ? updated : b);
        state.currentBooking = updated;
      });

    builder
      .addCase(createPaymentIntent.pending, (state) => { state.paymentLoading = true; })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.paymentData = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNewBooking, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
