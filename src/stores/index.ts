import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import projectsReducer from "./project.slice";
import preferencesReducer from "./preferences.slice";

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    preferences: preferencesReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppSelector = TypedUseSelectorHook<RootState>;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: AppSelector = useSelector;
