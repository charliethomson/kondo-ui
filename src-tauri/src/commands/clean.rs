use std::fs;

use kondo_lib::Project;

use crate::project::SerializableProject;

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
