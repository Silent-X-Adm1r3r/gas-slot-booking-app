import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchProviders = createAsyncThunk(
  'providers/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/providers', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch providers');
    }
  }
);

export const fetchProviderById = createAsyncThunk(
  'providers/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/providers/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Provider not found');
    }
  }
);

export const fetchProviderSlots = createAsyncThunk(
  'providers/fetchSlots',
  async ({ providerId, date }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/providers/${providerId}/slots`, { params: { date } });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch slots');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'providers/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/providers/categories');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

const providerSlice = createSlice({
  name: 'providers',
  initialState: {
    list: [],
    currentProvider: null,
    slots: [],
    categories: ['All'],
    pagination: { total: 0, page: 1, pages: 1 },
    filters: { search: '', category: 'All', city: '', minRating: '', sortBy: 'rating' },
    loading: false,
    slotsLoading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { search: '', category: 'All', city: '', minRating: '', sortBy: 'rating' };
    },
    clearCurrentProvider: (state) => {
      state.currentProvider = null;
      state.slots = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.providers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchProviderById.pending, (state) => { state.loading = true; })
      .addCase(fetchProviderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProvider = action.payload.provider;
      })
      .addCase(fetchProviderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchProviderSlots.pending, (state) => { state.slotsLoading = true; })
      .addCase(fetchProviderSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.slots = action.payload.slots;
      })
      .addCase(fetchProviderSlots.rejected, (state) => { state.slotsLoading = false; });

    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentProvider } = providerSlice.actions;
export default providerSlice.reducer;
