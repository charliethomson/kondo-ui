import { Event, listen, UnlistenFn } from "@tauri-apps/api/event";
import { createContext } from "react";
import { TypedUseSelectorHook } from "react-redux";
import { ProjectsAndPaths } from "../api";
import {
  AppDispatch,
  AppSelector,
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../stores";
import {
  addProjects,
  fetchProjects,
  populateProjects,
} from "../stores/project.slice";
import { makeFulfilled, makePending, makeRejected } from "./loading";

export const setupListeners = async (
  dispatch: AppDispatch,
  useSelector: AppSelector
) => {
  await listen(
    "kondo://add_projects/fulfilled",
    async (event: Event<ProjectsAndPaths>) => {
      console.log(`Recieved: ${JSON.stringify(event)}`);

      const payload = {
        ...event.payload,
        projects: await populateProjects(event.payload.projects),
      };

      dispatch(addProjects(makeFulfilled(payload)));
    }
  );
  await listen("kondo://add_projects/pending", (event: Event<void>) => {
    console.log(`Recieved: ${JSON.stringify(event)}`);

    dispatch(addProjects(makePending()));
  });
  await listen("kondo://add_projects/rejected", (event: Event<string>) => {
    console.log(`Recieved: ${JSON.stringify(event)}`);

    dispatch(addProjects(makeRejected(event.payload)));
  });
};
