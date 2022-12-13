import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";
import { getConfig, putConfig } from "../api";
import { isFulfilled, makeLoadingMatcher } from "../util/loading";

export interface KondoConfig {
  enableGlass: boolean;
}

export interface PreferencesState {
  config: KondoConfig;
}

export const commitPreferences = createAsyncThunk("preferences/put", putConfig);
export const fetchPreferences = createAsyncThunk(
  "preferences/fetch",
  getConfig
);

const initialState: PreferencesState = { config: { enableGlass: true } };

export const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) =>
    builder
      .addMatcher(...makeLoadingMatcher(commitPreferences, { field: () => {} }))
      .addMatcher(
        ...makeLoadingMatcher(fetchPreferences, {
          field(state, _action, status) {
            console.log(status);
            if (isFulfilled(status)) state.config = status.data;
            console.log(state);
          },
        })
      ),
});

export const { reset } = preferencesSlice.actions;

export default preferencesSlice.reducer;
