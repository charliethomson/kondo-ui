use std::{
    cell::{Cell, RefCell},
    io::Write,
    path::PathBuf,
    str::FromStr,
    sync::{Arc, RwLock},
};

use dirs::{config_dir, home_dir};
use figment::{
    providers::{Format, Json},
    value::{Dict, Map},
    Figment, Metadata, Profile, Provider, Source,
};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::{db::DatabaseBuilder, BASE_PATH, DATA_PATH, USER_CONFIG_PATH};

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
    pub fn get() -> Self {
        DatabaseBuilder::new().open().get_config().unwrap()
    }
    pub fn set(&self) {
        DatabaseBuilder::new().open().put_config(&self)
    }

    pub fn do_update(&self, app: AppHandle) {
        if (self.enable_glass) {
            for window in app.windows().iter() {}
        }
    }

    pub fn new() -> Self {
        let mut figment = Figment::new()
            .merge(Json::file(&*USER_CONFIG_PATH))
            .merge(DatabaseConfigProvider());

        let cfg: KondoConfig = figment.extract().unwrap_or_default();
        cfg.set();
        cfg
    }
}
struct DatabaseConfigProvider();
impl Provider for DatabaseConfigProvider {
    fn metadata(&self) -> Metadata {
        Metadata::named("Local database config")
            .source(Source::File(PathBuf::from_str(&*DATA_PATH).unwrap()))
    }

    fn data(&self) -> Result<Map<Profile, Dict>, figment::Error> {
        let profile = Profile::new("localdb");
        let cfg =
            serde_json::to_string(&DatabaseBuilder::new().open().get_config().unwrap()).unwrap();

        let mut map = Map::new();

        map.insert(profile, serde_json::de::from_str(&cfg).unwrap());
        Ok(map)
    }
}
