#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    error::Error,
    fs::{self, canonicalize, read_dir, FileType},
    io,
    path::PathBuf,
    str::FromStr,
};

use kondo_lib::{path_canonicalise, scan, Project, ProjectSize, ProjectType};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use tauri::{api::dialog, Manager};
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

lazy_static! {
    pub static ref HOME: String = {
        if cfg!(target_family = "unix") {
            std::env::var("HOME").expect("Bad, bad bad bad")
        } else {
            std::env::var("FOLDERID_Profile").expect("Bad, bad bad bad")
        }
    };
}

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

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadResponse {
    projects: Vec<SerializableProject>,
    search_paths: Vec<String>,
}

fn path_userlocal(path: String) -> String {
    if path.starts_with(&*HOME) {
        path.replace(&*HOME, "~")
    } else {
        path
    }
}

#[tauri::command]
async fn read(window: tauri::Window) -> Result<ReadResponse, String> {
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

fn scan_many(ps: Vec<PathBuf>) -> Vec<SerializableProject> {
    ps.into_iter()
        .flat_map(|p| scan(&p))
        .map(SerializableProject::from)
        .collect::<Vec<SerializableProject>>()
}

#[tauri::command]
async fn clean(project: SerializableProject) -> Result<(), String> {
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
async fn pretty_size(size: u64) -> String {
    kondo_lib::pretty_size(size)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let windows = [app.get_window("main").ok_or("Failed to get main window")?];

            for window in windows {
                #[cfg(target_os = "macos")]
                apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                    .map_err(|_| "Failed to apply vibrancy")?;

                #[cfg(target_os = "windows")]
                apply_blur(&window, Some((18, 18, 18, 125))).map_err(|_| "Failed to apply blur")?;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![clean, read, pretty_size])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
