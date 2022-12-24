use crate::config::KondoConfig;

#[tauri::command]
pub fn put_config(app_handle: tauri::AppHandle, preferences: KondoConfig) {
    preferences.set();
    let new_prefs = KondoConfig::get();
    new_prefs.do_update(app_handle);
}

#[tauri::command]
pub fn get_config() -> KondoConfig {
    KondoConfig::get()
}
