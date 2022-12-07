import { invoke } from "@tauri-apps/api";
import { Project } from "../stores/project.slice";
import { Identity } from "../util/identity";
import { Loading, makeFulfilled, makeRejected } from "../util/loading";

export interface ProjectsAndPaths {
  projects: Project[];
  searchPaths: string[];
}

export const promptFileSelect = (): Promise<ProjectsAndPaths> => {
  return invoke<ProjectsAndPaths>("read");
};

export const cleanProject = (project: Project): Promise<void> => {
  return invoke<void>("clean", { project });
};

export const cleanMany = (projects: Project[]): Promise<void[]> => {
  return Promise.all(projects.map(cleanProject));
};
