use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, Webview,
};
use tauri_plugin_dialog::{DialogExt, FilePath};

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct WatchedPresenceFile {
    path: String,
    contents: String,
    modified_ms: u128,
}

#[tauri::command]
fn choose_shared_folder(app: tauri::AppHandle) -> Option<String> {
    match app.dialog().file().blocking_pick_folder() {
        Some(FilePath::Path(path)) => Some(path.to_string_lossy().into_owned()),
        _ => None,
    }
}

#[tauri::command]
fn read_presence_folder(path: String) -> Result<Vec<WatchedPresenceFile>, String> {
    let directory = std::fs::canonicalize(path)
        .map_err(|_| "The selected folder is unavailable.".to_string())?;
    if !directory.is_dir() {
        return Err("The selected path is not a folder.".to_string());
    }

    let mut updates = Vec::new();
    let entries = std::fs::read_dir(&directory)
        .map_err(|_| "The selected folder cannot be read.".to_string())?;
    for entry in entries.take(200) {
        let entry = entry.map_err(|_| "A folder entry could not be read.".to_string())?;
        let file_path = entry.path();
        let file_name = entry.file_name().to_string_lossy().into_owned();
        if !file_name.ends_with(".presence.json") || !file_path.is_file() {
            continue;
        }
        let metadata = entry
            .metadata()
            .map_err(|_| "A presence file could not be inspected.".to_string())?;
        if metadata.len() > 1_048_576 {
            continue;
        }
        let contents = std::fs::read_to_string(&file_path)
            .map_err(|_| "A presence file could not be read.".to_string())?;
        let modified_ms = metadata
            .modified()
            .ok()
            .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|duration| duration.as_millis())
            .unwrap_or_default();
        updates.push(WatchedPresenceFile {
            path: file_path.to_string_lossy().into_owned(),
            contents,
            modified_ms,
        });
    }
    updates.sort_by_key(|file| file.modified_ms);
    Ok(updates)
}

#[cfg(test)]
mod tests {
    use super::read_presence_folder;

    #[test]
    fn shared_folder_reads_only_bounded_presence_files() {
        let unique = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("system clock")
            .as_nanos();
        let directory = std::env::temp_dir().join(format!("presence-bridge-{unique}"));
        std::fs::create_dir(&directory).expect("create fixture folder");
        std::fs::write(directory.join("ava.presence.json"), "{\"fixture\":true}")
            .expect("write presence fixture");
        std::fs::write(directory.join("notes.json"), "private notes")
            .expect("write ignored fixture");

        let files = read_presence_folder(directory.to_string_lossy().into_owned())
            .expect("read fixture folder");
        assert_eq!(files.len(), 1);
        assert!(files[0].path.ends_with("ava.presence.json"));
        assert_eq!(files[0].contents, "{\"fixture\":true}");

        std::fs::remove_dir_all(directory).expect("remove fixture folder");
    }
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct NativeOpenerResult {
    url: String,
    ok: bool,
    error: Option<String>,
}

fn native_opener_smoke_requested() -> bool {
    std::env::args().any(|argument| argument == "--smoke-opener")
}

#[tauri::command]
fn finish_native_opener_smoke(app: tauri::AppHandle, results: Vec<NativeOpenerResult>) {
    if !native_opener_smoke_requested() {
        return;
    }

    let expected = [
        "slack://user?team=T123&id=U123",
        "msteams://teams.microsoft.com/l/chat/0/0?users=ava@example.com",
        "https://meet.google.com/abc-defg-hij",
        "mailto:ava@example.com",
        "zoommtg://zoom.us/join?confno=123456789",
        "tel:+15550199",
    ];
    let passed = results.len() == expected.len()
        && results.iter().zip(expected).all(|(result, expected_url)| {
            println!(
                "native opener {} {}{}",
                if result.ok { "accepted" } else { "rejected" },
                result.url,
                result
                    .error
                    .as_deref()
                    .map(|error| format!(": {error}"))
                    .unwrap_or_default()
            );
            result.ok && result.url == expected_url
        });

    app.exit(if passed { 0 } else { 1 });
}

fn run_native_opener_smoke(webview: &Webview) {
    if !native_opener_smoke_requested() {
        return;
    }

    webview
        .eval(
            r#"
            (async () => {
              const urls = [
                "slack://user?team=T123&id=U123",
                "msteams://teams.microsoft.com/l/chat/0/0?users=ava@example.com",
                "https://meet.google.com/abc-defg-hij",
                "mailto:ava@example.com",
                "zoommtg://zoom.us/join?confno=123456789",
                "tel:+15550199"
              ];
              const results = [];
              for (const url of urls) {
                try {
                  await window.__TAURI_INTERNALS__.invoke("plugin:opener|open_url", { url });
                  results.push({ url, ok: true, error: null });
                } catch (error) {
                  results.push({ url, ok: false, error: String(error) });
                }
              }
              await window.__TAURI_INTERNALS__.invoke("finish_native_opener_smoke", { results });
            })();
            "#,
        )
        .expect("failed to start native opener smoke");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            finish_native_opener_smoke,
            choose_shared_folder,
            read_presence_folder
        ])
        .on_page_load(|webview, payload| {
            if matches!(payload.event(), tauri::webview::PageLoadEvent::Finished) {
                run_native_opener_smoke(webview);
            }
        })
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "Show Presence Bridge", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().expect("app icon").clone())
                .tooltip("Presence Bridge")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            if let Some(window) = app.get_webview_window("main") {
                let window_to_hide = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = window_to_hide.hide();
                    }
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Presence Bridge");
}
