use tauri::{
    api::dialog, AboutMetadata, App, CustomMenuItem, Manager, Menu, MenuItem, Submenu, Window,
    WindowBuilder,
};

use crate::{
    apply_glass,
    command::{path_userlocal, scan_many, ReadResponse},
    event::Event,
};

#[derive(Clone, Copy)]
pub enum KondoMenuItem {
    Preferences,
    Open,
}
impl KondoMenuItem {
    pub fn execute(self, window: &Window) {
        match self {
            KondoMenuItem::Preferences => {
                let app_handle = window.app_handle();
                let prefs_window = WindowBuilder::new(
                    &app_handle,
                    "preferences",
                    tauri::WindowUrl::App("/preferences".into()),
                )
                .transparent(true)
                .title("Kondo - Preferences")
                .build()
                .expect("Failed to create preferences window");

                apply_glass(&prefs_window).unwrap();
                println!("Preferences called")
            }
            KondoMenuItem::Open => {
                let app_handle = window.app_handle();
                Event::AddProjectsPending
                    .emit(&app_handle)
                    .expect("Failed to send message to UI");
                dialog::FileDialogBuilder::new().pick_folders(move |paths| match paths {
                    Some(p) => {
                        let search_paths = p
                            .iter()
                            .map(|pb| pb.as_os_str().to_string_lossy().to_string())
                            .map(path_userlocal)
                            .collect::<Vec<_>>();
                        let projects = scan_many(p);
                        Event::AddProjectsFulfilled(ReadResponse {
                            projects,
                            search_paths,
                        })
                        .emit(&app_handle)
                        .expect("Failed to send message to UI");
                    }
                    None => Event::AddProjectsRejected("Pick aborted".into())
                        .emit(&app_handle)
                        .expect("Failed to send message to UI"),
                });
            }
        }
    }

    pub fn from<'a>(item_id: &'a str) -> Option<Self> {
        match item_id {
            "open" => Some(Self::Open),
            "preferences" => Some(Self::Preferences),
            _ => {
                println!("Unrecognized menu item: {}", item_id);
                None
            }
        }
    }
}
impl ToString for KondoMenuItem {
    fn to_string(&self) -> String {
        match self {
            KondoMenuItem::Preferences => "preferences".into(),
            KondoMenuItem::Open => "open".into(),
        }
    }
}

pub fn get_menu() -> Menu {
    let mut menu = Menu::new();
    menu = menu.add_submenu(Submenu::new(
        "Kondo",
        Menu::new()
            .add_native_item(MenuItem::About("Kondo".into(), AboutMetadata::default()))
            .add_native_item(MenuItem::Separator)
            .add_item(
                CustomMenuItem::new(KondoMenuItem::Preferences.to_string(), "Preferences")
                    .accelerator("SUPER+,"),
            )
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Hide)
            .add_native_item(MenuItem::HideOthers)
            .add_native_item(MenuItem::ShowAll)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit),
    ));

    let mut file_menu = Menu::new();
    file_menu = file_menu
        .add_item(
            CustomMenuItem::new(KondoMenuItem::Open.to_string(), "Open").accelerator("SUPER+O"),
        )
        .add_native_item(MenuItem::CloseWindow);

    menu = menu.add_submenu(Submenu::new("File", file_menu));

    let mut edit_menu = Menu::new();
    edit_menu = edit_menu.add_native_item(MenuItem::Undo);
    edit_menu = edit_menu.add_native_item(MenuItem::Redo);
    edit_menu = edit_menu.add_native_item(MenuItem::Separator);
    edit_menu = edit_menu.add_native_item(MenuItem::SelectAll);
    menu = menu.add_submenu(Submenu::new(
        "View",
        Menu::new().add_native_item(MenuItem::EnterFullScreen),
    ));

    menu
}
