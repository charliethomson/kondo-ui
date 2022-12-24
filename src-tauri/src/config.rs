use std::{
    fs::{File, OpenOptions},
    path::Path,
};

use log::{info, warn};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::{apply_glass, USER_CONFIG_PATH};

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
pub struct KondoConfig {
    pub enable_glass: bool,
}
impl Default for KondoConfig {
    fn default() -> Self {
        Self { enable_glass: true }
    }
}

impl KondoConfig {
    fn set_default() -> Self {
        let s = Self::default();
        s.set();
        return s;
    }

    pub fn get() -> Self {
        if !Path::new(&*USER_CONFIG_PATH).exists() {
            return Self::set_default();
        }

        let f = File::open(&*USER_CONFIG_PATH).unwrap();

        match serde_json::from_reader(f) {
            Ok(this) => {
                info!("Read config from {:#?}", *USER_CONFIG_PATH);
                this
            }
            Err(e) => {
                warn!("Failed to read config from {:#?}: {}", *USER_CONFIG_PATH, e);
                Self::set_default()
            }
        }
    }
    pub fn set(&self) {
        let f = OpenOptions::new()
            .create(true)
            .write(true)
            .open(&*USER_CONFIG_PATH)
            .unwrap();

        match serde_json::to_writer_pretty(f, self) {
            Ok(()) => {
                info!("Config written to {:#?}", *USER_CONFIG_PATH);
            }
            Err(e) => {
                warn!("Failed to write config to {:#?}: {}", *USER_CONFIG_PATH, e);
            }
        }
    }

    pub fn do_update(&self, app: AppHandle) {
        if self.enable_glass {
            for (_label, window) in app.windows().iter() {
                // todo; handle error
                apply_glass(window).unwrap();
            }
        }
    }
}
