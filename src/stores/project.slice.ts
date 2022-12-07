import {
  createAsyncThunk,
  createSlice,
  Draft,
  PayloadAction,
  SliceCaseReducers,
} from "@reduxjs/toolkit";
import { RootState } from ".";
import {
  cleanMany,
  cleanProject,
  ProjectsAndPaths,
  promptFileSelect,
} from "../api";
import { getIdentity, Identity } from "../util/identity";
import {
  isFulfilled,
  Loading,
  LoadingStatus,
  makeFulfilled,
  makeIdle,
  makeLoadingMatcher,
  makePending,
  makeRejected,
  mapLoading,
} from "../util/loading";

export type ProjectType =
  | "Cargo"
  | "Node"
  | "Unity"
  | "Stack"
  | "SBT"
  | "Maven"
  | "Unreal";

export interface Project {
  path: string;
  projectType: ProjectType;
  size: {
    artifactSize: number;
    nonArtifactSize: number;
    dirs: {
      fileName: string;
      isArtifact: boolean;
      size: number;
    }[];
  };
  selected: boolean;
  hasArtifacts: boolean;
  identity: Identity;
}

export interface ProjectState {
  projects: Loading<Project[]>;
  // identity -> success message | error message
  cleaned: Record<string, Loading<string, string>>;
  searchPaths: Loading<string>[];
  cleanedSpace: number;
  totalSpace: number;
  count: Loading<string>;
}

const initialState: ProjectState = {
  cleaned: {},
  projects: makeIdle(),
  searchPaths: [],
  cleanedSpace: 0,
  totalSpace: 0,

  count: makeFulfilled("0"),
};

export const fetchProjects = createAsyncThunk("projects/fetch", async () => {
  const { projects, searchPaths } = await promptFileSelect();

  return {
    projects: await Promise.all(
      projects.map(async (p) => ({
        ...p,
        selected: false,
        hasArtifacts: p.size.artifactSize !== 0,
        identity: await getIdentity(p.path),
      }))
    ),
    searchPaths,
  };
});

export const addSearchPath = createAsyncThunk(
  "projects/searchPaths/add",
  async () => {}
);
export const clean = createAsyncThunk(
  "projects/clean",
  async (identities: Identity[], { getState }): Promise<void[]> => {
    const state = getState() as RootState;
    if (state.projects.projects.status !== "fulfilled") return [];

    const projects = state.projects.projects.data.filter((project) =>
      identities.includes(project.identity)
    );

    return await cleanMany(projects);
  }
);

export const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    reset: () => initialState,
    toggleSelected: (
      state: ProjectState,
      { payload }: PayloadAction<string>
    ) => {
      if (state.projects.status !== "fulfilled") return;
      state.projects.data = state.projects.data.map((p) =>
        p.identity === payload ? { ...p, selected: !p.selected } : p
      );
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.projects = makePending();
      })
      .addCase(
        fetchProjects.fulfilled,
        (state, { payload }: PayloadAction<ProjectsAndPaths>) => {
          state.projects = makeFulfilled(payload.projects);
          state.searchPaths = [
            ...state.searchPaths,
            ...payload.searchPaths.map(makeFulfilled),
          ];
        }
      )
      .addMatcher(
        ...makeLoadingMatcher<ProjectState>(clean, {
          onPending: (state, action) => {
            action.meta.arg.forEach((identity: Identity) => {
              if (isFulfilled(state.projects))
                state.projects.data = state.projects.data.map((project) =>
                  project.identity === identity
                    ? { ...project, selected: false }
                    : project
                );
            });
          },
          field: (state, action, status) => {
            action.meta.arg.forEach((identity: Identity) => {
              state.cleaned[identity] = mapLoading(status, () => "Success!");
            });
          },
        })
      ),
});

export const { reset, toggleSelected } = projectsSlice.actions;

export default projectsSlice.reducer;
