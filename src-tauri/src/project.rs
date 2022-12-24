use std::path::PathBuf;

use kondo_lib::{Project, ProjectSize, ProjectType};
use serde::{Deserialize, Serialize};

use crate::commands::path_userlocal;

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
