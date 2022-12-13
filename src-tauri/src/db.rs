use std::{fs::OpenOptions, path::PathBuf, str::FromStr};

use log::warn;
use rustbreak::{deser::Ron, FileDatabase};
use serde::{Deserialize, Serialize};

use crate::{config::KondoConfig, DATA_PATH};

#[derive(Serialize, Deserialize, Clone, Default)]
struct DatabaseModel {
    config: KondoConfig,
}

type _Db = FileDatabase<DatabaseModel, Ron>;

pub struct DatabaseBuilder {
    _path: PathBuf,
}
impl DatabaseBuilder {
    pub fn new() -> Self {
        Self {
            _path: PathBuf::from_str(&*DATA_PATH).unwrap(),
        }
    }
    pub fn with_path<P: Into<PathBuf>>(mut self, path: P) -> Self {
        self._path = path.into();
        self
    }
    pub fn open(self) -> Database {
        println!("{:?}", self._path);
        let file = OpenOptions::new()
            .create(true)
            .read(true)
            .write(true)
            .open(self._path)
            .expect("Failed to open/create database file");
        let db = _Db::from_file(file, DatabaseModel::default()).expect("Failed to create database");
        Database { db }
    }

    fn configure(&self, db: _Db) {}
}

pub struct Database {
    db: _Db,
}
impl Database {
    pub fn get_config(&self) -> rustbreak::Result<KondoConfig> {
        self.db.read(|db| db.config)
    }
    pub fn put_config(&mut self, config: &KondoConfig) {
        self.db.write(|db| db.config = config.clone());
    }
}
