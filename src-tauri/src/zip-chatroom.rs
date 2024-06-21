use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{self, Write};
use zip::write::FileOptions;
use zip::ZipWriter;

#[derive(Serialize, Deserialize)]
struct Chatroom {
    chat_identifier: String,
    messages: Vec<Message>,
}

#[derive(Serialize, Deserialize)]
struct Message {
    attachments: Vec<Attachment>,
}

#[derive(Serialize, Deserialize)]
struct Attachment {
    mime_type: Option<String>,
    filepath: Option<String>,
    transfer_name: String,
}

fn zip_chatroom_data(chatroomJsonStr: &String) -> io::Result<Vec<u8>> {
    let chatroom: Chatroom = serde_json::from_str(chatroomJsonStr).unwrap();

    let mut zip_cursor = io::Cursor::new(Vec::new());
    let mut zip = ZipWriter::new(&mut zip_cursor);

    let json_string = serde_json::to_string(&chatroom).unwrap_or_default();
    zip.start_file(
        format!("messages-{}.json", chatroom.chat_identifier),
        FileOptions::default(),
    )?;
    zip.write_all(json_string.as_bytes())?;

    // Optional: Create a directory for attachments within the ZIP
    zip.add_directory("attachments/", FileOptions::default())?;

    let mut attachment_errors: Vec<String> = Vec::new();

    for message in &chatroom.messages {
        for attachment in &message.attachments {
            if let Some(mime_type) = &attachment.mime_type {
                if mime_type.contains("image") {
                    if let Some(filepath) = &attachment.filepath {
                        let path = filepath.replace("~", "").replace("/", ""); // Adjust path sanitization as needed
                        match File::open(&path) {
                            Ok(mut file) => {
                                let mut buffer = Vec::new();
                                match file.read_to_end(&mut buffer) {
                                    Ok(_) => {
                                        zip.start_file(
                                            format!("attachments/{}", attachment.transfer_name),
                                            FileOptions::default(),
                                        )?;
                                        zip.write_all(&buffer)?;
                                    }
                                    Err(_) => {
                                        attachment_errors.push(attachment.transfer_name.clone())
                                    }
                                }
                            }
                            Err(_) => attachment_errors.push(attachment.transfer_name.clone()),
                        }
                    }
                }
            }
        }
    }

    // Not shown: Handle attachment_errors as needed
    zip.finish()?;
    Ok(zip_cursor.into_inner())
}

fn main() {
    // Dummy chatroom data, replace with actual data loading logic
    let chatroom = Chatroom {
        chat_identifier: "123".to_string(),
        messages: vec![],
    };

    match zip_chatroom_data(&chatroom) {
        Ok(zip_bytes) => {
            // Here you can save zip_bytes to a file or use them as needed
            println!("ZIP created successfully. Size: {} bytes", zip_bytes.len());
        }
        Err(error) => {
            println!("Failed to create ZIP: {}", error);
        }
    }
}
