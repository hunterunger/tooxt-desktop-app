// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod imessage;
use crate::imessage::get_messages_json;
use imessage_database::util::dirs::default_db_path;
use std::{fs, process::Command};
use window_vibrancy::{ apply_vibrancy, NSVisualEffectMaterial};
use tauri::Manager;

#[tauri::command]
fn get_messages(
    custompath: &str,
    fromdate: &str,
    todate: &str,
    chatidfilter: Option<i32>,
    maxmessagespergroup: Option<i32>,
) -> String {
    /*
    Open the chat.db file, and read the messages table, converting it to a JSON string, and returning it to the frontend.
    */

    // default path to chat.db

    // if the user has specified a custom path, use that instead

    let path;

    if custompath != "" {
        path = custompath.to_string();
    } else {
        let default_path = default_db_path();

        path = default_path.to_str().unwrap().to_string();
    };

    // run the query
    let result = get_messages_json(&path, fromdate, todate, chatidfilter, maxmessagespergroup);

    // ensure result is a string
    let result = result.unwrap();

    // return the JSON string to the frontend
    result
}

#[tauri::command]
fn test_disk_permission() -> bool {
    /*
    Test if the user has permission to read the chat.db file.
    */

    // default path to chat.db
    let secured_path = default_db_path();

    // try to open the file
    let file_exists = fs::File::open(&secured_path).is_ok();

    // return true if the app has permission to read the file
    file_exists
}

#[tauri::command]
fn run_shell_command(command: &str) -> String {
    /*
    Run a shell command and return the output.
    */

    // run the command
    let output = std::process::Command::new("sh")
        .arg("-c")
        .arg(command)
        .output()
        .expect("failed to execute sh");

    // convert the output to a string
    let output = String::from_utf8_lossy(&output.stdout).to_string();

    // return the output
    output
}

#[tauri::command]
fn copy_dir(src: &str, dest: &str) -> bool {
    /*
    Copy a directory from src to dest.
    */

    // copy the directory
    let result = fs_extra::dir::copy(src, dest, &fs_extra::dir::CopyOptions::new());

    // return true if the directory was copied successfully
    result.is_ok()
}

#[tauri::command]
fn convert_heic_to_jpg(src: &str, dest: &str) -> String {
    /*
    Convert a HEIC file to a JPG file.
    */

    // run the command
    let command = Command::new("sips")
        .args(&vec!["-s", "format", "jpeg", src, "--output", &dest])
        .output()
        .expect("failed to execute sh");

    println!("Command: {:?}", command);

    let output_string = String::from_utf8_lossy(&command.stdout).to_string();

    // return the output
    output_string
}

fn main() {
    // let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    // let close = CustomMenuItem::new("close".to_string(), "Close");
    // let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));
    // let menu = Menu::new()
    // .add_native_item(MenuItem::Copy)
    //     .add_item(CustomMenuItem::new("hide", "Hide"))
    //     .add_submenu(submenu);

    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
    
            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
            .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
    
            #[cfg(target_os = "windows")]
            apply_blur(&window, Some((18, 18, 18, 125)))
            .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
    
            Ok(())
        })
        // .menu(menu)
        .invoke_handler(tauri::generate_handler![
            get_messages,
            test_disk_permission,
            run_shell_command,
            copy_dir,
            convert_heic_to_jpg
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
