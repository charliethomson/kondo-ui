// kondo://add_projects/fulfilled
// kondo://add_projects/rejected
// kondo://add_projects/pending

use tauri::{App, Manager};

use crate::command::ReadResponse;

#[derive(Debug, Clone)]
pub enum Event {
    AddProjectsFulfilled(ReadResponse),
    AddProjectsRejected(String),
    AddProjectsPending,
}
impl Event {
    pub fn emit<A: tauri::Manager<R>, R: tauri::Runtime>(&self, app: &A) -> tauri::Result<()> {
        match self {
            Event::AddProjectsFulfilled(payload) => {
                println!("Emitting: kondo://add_projects/fulfilled");
                app.emit_all("kondo://add_projects/fulfilled", payload)
            }
            Event::AddProjectsRejected(payload) => {
                println!("Emitting: kondo://add_projects/rejected");
                app.emit_all("kondo://add_projects/rejected", payload)
            }
            Event::AddProjectsPending => {
                println!("Emitting: kondo://add_projects/pending");
                app.emit_all("kondo://add_projects/pending", ())
            }
        }
    }
}
