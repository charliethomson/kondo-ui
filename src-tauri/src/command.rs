use std::{
    error::Error,
    fs::{self, canonicalize, read_dir, FileType},
    io,
    path::PathBuf,
    str::FromStr,
};

use dirs::home_dir;
use kondo_lib::{path_canonicalise, scan, Project, ProjectSize, ProjectType};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use tauri::{api::dialog, App, Manager, Window};
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

use crate::config::KondoConfig;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SerializableProjectType {
    Cargo,
    Node,
    Unity,
    Stack,
    SBT,
    Maven,
    Unreal,
}
impl From<ProjectType> for SerializableProjectType {
    fn from(p: ProjectType) -> Self {
        match p {
            ProjectType::Cargo => Self::Cargo,
            ProjectType::Node => Self::Node,
            ProjectType::Unity => Self::Unity,
            ProjectType::Stack => Self::Stack,
            ProjectType::SBT => Self::SBT,
            ProjectType::Maven => Self::Maven,
            ProjectType::Unreal => Self::Unreal,
        }
    }
}
impl From<SerializableProjectType> for ProjectType {
    fn from(p: SerializableProjectType) -> Self {
        match p {
            SerializableProjectType::Cargo => Self::Cargo,
            SerializableProjectType::Node => Self::Node,
            SerializableProjectType::Unity => Self::Unity,
            SerializableProjectType::Stack => Self::Stack,
            SerializableProjectType::SBT => Self::SBT,
            SerializableProjectType::Maven => Self::Maven,
            SerializableProjectType::Unreal => Self::Unreal,
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectDir {
    pub file_name: String,
    pub size: u64,
    pub pretty_size: String,
    pub is_artifact: bool,
}
impl From<(String, u64, bool)> for ProjectDir {
    fn from(dir: (String, u64, bool)) -> Self {
        Self {
            file_name: dir.0,
            size: dir.1,
            pretty_size: kondo_lib::pretty_size(dir.1),
            is_artifact: dir.2,
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SerializableProjectSize {
    pub artifact_size: u64,
    pub non_artifact_size: u64,
    pub artifact_size_pretty: String,
    pub non_artifact_size_pretty: String,
    pub dirs: Vec<ProjectDir>,
}
impl From<ProjectSize> for SerializableProjectSize {
    fn from(sz: ProjectSize) -> Self {
        Self {
            artifact_size: sz.artifact_size,
            non_artifact_size: sz.non_artifact_size,
            artifact_size_pretty: kondo_lib::pretty_size(sz.artifact_size),
            non_artifact_size_pretty: kondo_lib::pretty_size(sz.non_artifact_size),
            dirs: sz
                .dirs
                .into_iter()
                .map(ProjectDir::from)
                .collect::<Vec<_>>(),
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SerializableProject {
    pub project_type: SerializableProjectType,
    pub path: String,
    pub size: SerializableProjectSize,
}
impl From<Project> for SerializableProject {
    fn from(p: Project) -> Self {
        Self {
            project_type: p.project_type.clone().into(),
            path: path_userlocal(p.path.clone().as_os_str().to_string_lossy().to_string()),
            size: p.size_dirs().into(),
        }
    }
}
impl From<SerializableProject> for Project {
    fn from(p: SerializableProject) -> Self {
        Self {
            project_type: p.project_type.clone().into(),
            path: PathBuf::from(shellexpand::tilde(&p.path).to_string()),
        }
    }
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ReadResponse {
    pub projects: Vec<SerializableProject>,
    pub search_paths: Vec<String>,
}

pub fn path_userlocal(path: String) -> String {
    if path.starts_with(home_dir().unwrap().to_str().unwrap()) {
        path.replace(home_dir().unwrap().to_str().unwrap(), "~")
    } else {
        path
    }
}

#[tauri::command]
pub async fn read() -> Result<ReadResponse, String> {
    match dialog::blocking::FileDialogBuilder::new().pick_folders() {
        Some(p) => {
            let search_paths = p
                .iter()
                .map(|pb| pb.as_os_str().to_string_lossy().to_string())
                .map(path_userlocal)
                .collect::<Vec<_>>();
            let projects = scan_many(p);
            Ok(ReadResponse {
                projects,
                search_paths,
            })
        }
        None => Err("Pick aborted".into()),
    }
}

pub fn scan_many(ps: Vec<PathBuf>) -> Vec<SerializableProject> {
    ps.into_iter()
        .flat_map(|p| scan(&p))
        .map(SerializableProject::from)
        .collect::<Vec<SerializableProject>>()
}

#[tauri::command]
pub async fn clean(project: SerializableProject) -> Result<(), String> {
    let project = Project::from(project);
    for artifact_dir in project
        .artifact_dirs()
        .iter()
        .copied()
        .map(|ad| project.path.join(ad))
        .filter(|ad| ad.exists())
    {
        if let Err(e) = fs::remove_dir_all(&artifact_dir) {
            return Err(e.to_string());
        }
    }
    Ok(())
}

#[tauri::command]
pub fn put_config(app_handle: tauri::AppHandle, preferences: KondoConfig) {
    preferences.set();
    let new_prefs = KondoConfig::get();
    new_prefs.do_update(app_handle);
}

#[tauri::command]
pub fn get_config() -> KondoConfig {
    KondoConfig::get()
}
