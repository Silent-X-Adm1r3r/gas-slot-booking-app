import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import providerReducer from './slices/providerSlice';
import bookingReducer from './slices/bookingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    providers: providerReducer,
    bookings: bookingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
