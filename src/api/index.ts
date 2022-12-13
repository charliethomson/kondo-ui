import { invoke } from "@tauri-apps/api";
import { KondoConfig } from "../stores/preferences.slice";
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

export const getConfig = (): Promise<KondoConfig> => {
  return invoke<KondoConfig>("get_config");
};
export const putConfig = (config: KondoConfig): Promise<void> => {
  return invoke<void>("put_config", { config });
};
