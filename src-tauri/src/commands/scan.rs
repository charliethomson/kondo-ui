use tauri::api::dialog;

use super::util::{path_userlocal, scan_many, ReadResponse};

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
