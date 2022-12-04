import { invoke } from "@tauri-apps/api/tauri";
import create from "zustand";
import { devtools, persist } from "zustand/middleware";
import { uniqBy, uniq } from "lodash-es";

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
}

export const getProjectSize = (project: Project): number => {
  if (!project.hasArtifacts) return -1;
  return project.size.artifactSize;
};

type LoadingStatus = "idle" | "pending" | "fulfilled" | "rejected";

interface ProjectState {
  status: LoadingStatus;
  addStatus: LoadingStatus;
  cleanStatus: LoadingStatus;
  projects: Project[];
  cleanedSpace: number;
  totalSpace: number;
  searchPaths: string[];
  reset?: () => void;
  fetch?: () => Promise<void>;
  addDirectory?: () => Promise<void>;
  clean?: (project: Project) => Promise<void>;
  cleanSelected?: () => Promise<void>;
  cleanAll?: () => Promise<void>;
  toggleSelected?: (project: Project) => void;
}

const initialState: ProjectState = {
  projects: [] as Project[],
  cleanedSpace: 0,
  totalSpace: 0,
  status: "idle",
  addStatus: "idle",
  cleanStatus: "idle",
  searchPaths: [],
};

export const useProjectStore = create<ProjectState>()(
  devtools((set, get) => ({
    ...initialState,

    reset: () => set(initialState),

    fetch: async () => {
      set({ status: "pending" });
      try {
        const { projects, searchPaths } = (await invoke("read")) as {
          projects: Project[];
          searchPaths: string[];
        };
        set({
          status: "fulfilled",
          searchPaths,
          projects: projects.map((p) => ({
            ...p,
            selected: false,
            hasArtifacts: p.size.artifactSize !== 0,
          })),
        });
      } catch (e) {
        set({ status: "rejected" });
        throw e;
      }
    },
    addDirectory: async () => {
      set({ addStatus: "pending" });

      try {
        const { projects, searchPaths } = (await invoke("read")) as {
          projects: Project[];
          searchPaths: string[];
        };
        set((prev) => ({
          addStatus: "fulfilled",
          searchPaths: uniq([...prev.searchPaths, ...searchPaths]),
          projects: uniqBy(
            [
              ...prev.projects,
              ...projects.map((p) => ({
                ...p,
                selected: false,
                hasArtifacts: p.size.artifactSize !== 0,
              })),
            ],
            (p) => p.path
          ),
        }));
      } catch (e) {
        set({ addStatus: "rejected" });
        throw e;
      }
    },
    clean: async (project: Project) => {
      set({ cleanStatus: "pending" });
      try {
        await invoke("clean", { project });
        set((state) => {
          return {
            cleanStatus: "fulfilled",
            cleanedSpace: state.cleanedSpace + project.size.artifactSize,
            projects: state.projects.map((p) =>
              p.path === project.path
                ? { ...p, hasArtifacts: false, selected: false }
                : p
            ),
          };
        });
      } catch (e) {
        console.log(e);
        set({ cleanStatus: "rejected" });
      }
    },
    cleanSelected: async (): Promise<void> => {
      const { projects, clean } = get();

      projects.filter((project) => project.selected).map(clean!);
    },
    cleanAll: async (): Promise<void> => {
      const { projects, clean } = get();

      projects.filter((project) => project.hasArtifacts).map(clean!);
    },
    toggleSelected: (project: Project) => {
      set((state) => ({
        projects: state.projects.map((p) =>
          p.path === project.path ? { ...p, selected: !p.selected } : p
        ),
      }));
    },
  }))
);
