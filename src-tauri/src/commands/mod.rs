mod clean;
mod config;
mod scan;

mod util {
    use crate::project::SerializableProject;
    use dirs::home_dir;
    use kondo_lib::scan;
    use serde::Serialize;
    use std::path::PathBuf;

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

    pub fn scan_many(ps: Vec<PathBuf>) -> Vec<SerializableProject> {
        ps.into_iter()
            .flat_map(|p| scan(&p))
            .map(SerializableProject::from)
            .collect::<Vec<SerializableProject>>()
    }
}

pub use clean::*;
pub use config::*;
pub use scan::*;
pub use util::*;
