#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
mod commands;
mod config;
mod event;
mod menu;
mod project;

use std::{fs, io};

use config::KondoConfig;
use lazy_static::lazy_static;
use log::info;
use menu::{get_menu, KondoMenuItem};
use tauri::{App, Manager, Window};
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

use crate::commands::*;

lazy_static! {
    pub static ref BASE_PATH: String = format!("{}/Kondo", dirs::data_dir().unwrap().display());
    pub static ref LOGGING_PATH: String =
        format!("{}/Kondo/logs", dirs::data_dir().unwrap().display());
    pub static ref DATA_FOLDER_PATH: String =
        format!("{}/Kondo", dirs::data_dir().unwrap().display());
    pub static ref DATA_PATH: String =
        format!("{}/Kondo/db.ron", dirs::data_dir().unwrap().display());
    pub static ref USER_CONFIG_FOLDER_PATH: String =
        format!("{}/.kondo", dirs::home_dir().unwrap().display());
    pub static ref USER_CONFIG_PATH: String =
        format!("{}/.kondo/kondo.json", dirs::home_dir().unwrap().display());
}

pub fn apply_glass(window: &Window) -> Result<(), ()> {
    #[cfg(target_os = "macos")]
    apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None).map_err(|_| ())?;

    #[cfg(target_os = "windows")]
    apply_blur(&window, Some((18, 18, 18, 125))).map_err(|_| ())?;

    Ok(())
}

fn make_glass(app: &mut App) -> Result<(), &str> {
    let windows = [app.get_window("main").ok_or("Failed to get main window")?];

    for window in windows {
        if let Err(_) = apply_glass(&window) {
            return Err("Failed to apply glass");
        }
    }
    Ok(())
}

fn setup_logger() -> Result<(), fern::InitError> {
    fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "{}[{}][{}] {}",
                chrono::Local::now().format("[%Y-%m-%d][%H:%M:%S]"),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(log::LevelFilter::Debug)
        .chain(std::io::stdout())
        .chain(fern::log_file("output.log")?)
        .apply()?;
    Ok(())
}

fn setup_dirs() -> io::Result<()> {
    fs::create_dir_all(&*BASE_PATH)?;
    fs::create_dir_all(&*LOGGING_PATH)?;
    fs::create_dir_all(&*DATA_FOLDER_PATH)?;
    fs::create_dir_all(&*USER_CONFIG_FOLDER_PATH)?;
    Ok(())
}

fn main() {
    setup_logger().expect("Failed to set up logging");
    setup_dirs().expect("Failed to create directories");
    info!("Starting...");
    tauri::Builder::default()
        .menu(get_menu())
        .on_menu_event(|event| {
            if let Some(item) = KondoMenuItem::from(event.menu_item_id()) {
                item.execute(event.window())
            }
        })
        .setup(|app| {
            if KondoConfig::get().enable_glass {
                make_glass(app)?;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            clean, read, get_config, put_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
