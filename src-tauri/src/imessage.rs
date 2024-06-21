use imessage_database::tables::attachment::Attachment;
use imessage_database::tables::chat::Chat;
use imessage_database::tables::handle::Handle;
use imessage_database::tables::table::{Cacheable, Deduplicate};
use imessage_database::util::dates::{format, get_offset};
use imessage_database::util::query_context::QueryContext;
use imessage_database::{
    error::table::TableError,
    tables::{
        chat_handle::ChatToHandle,
        messages::Message,
        table::{get_connection, Table},
    },
};
use serde_json::json;
use serde_json::{self, Value};
use std::collections::HashMap;
use std::path::Path;

pub fn get_messages_json(
    path: &str,
    min_date_str: &str,
    max_date_str: &str,
    chat_id_filter: Option<i32>,
    max_messages_per_group: Option<i32>,
) -> Result<String, TableError> {
    /*
    path: &str - the path to the iMessage database
    min_date_str: &str - the minimum date to get messages from in the format "YYYY-MM-DD HH:MM:SS"
    max_date_str: &str - the maximum date to get messages from in the format "YYYY-MM-DD HH:MM:SS"
    */

    // Create a read-only connection to an iMessage database
    let db_path = Path::new(path);
    let db = get_connection(db_path).unwrap();

    //
    let mut query_context = QueryContext::default();
    let _ = query_context.set_start(min_date_str);
    let _ = query_context.set_end(max_date_str);

    // Create SQL statement
    let mut statement = Message::stream_rows(&db, &query_context).map_err(|e| {
        println!("Error: {:?}", e);
        e
    })?;

    // Execute statement
    let mut messages = statement
        .query_map([], |row| Ok(Message::from_row(row)))
        .unwrap()
        .collect::<Result<Vec<_>, _>>()
        .unwrap();

    // when max_messages_per_group is set, reverse the messages so that the most recent messages are processed first
    if max_messages_per_group.is_some() {
        messages.reverse();
    }

    // chatrooms contains information like the chat_identifier, service_name (ie SMS), display_name (maybe "Family Chat"), and rowid
    let chatrooms = Chat::cache(&db).unwrap();

    // all chatroom participants (by chat_id only)
    let chatroom_participants = ChatToHandle::cache(&db).unwrap();

    // all chatroom participants {chat_id: [user_id1, user_id2, ...]}
    let real_chatrooms = ChatToHandle::dedupe(&chatroom_participants);
    // println!("Real Chatrooms: {:?}", real_chatrooms);

    // all participants {user_id: phone_number}
    let participants = Handle::cache(&db).unwrap();

    // create a hashmap to store the chatrooms with messages
    let mut chatrooms_with_messages: HashMap<i32, Value> = HashMap::new();

    let mut total_messages_so_far = 0;
    for message in messages {
        let mut msg = Message::extract(Ok(message))?;

        if chat_id_filter.is_some() && msg.chat_id != chat_id_filter {
            continue;
        }

        total_messages_so_far += 1;

        // print when total_messages_so_far is a power of 10
        if total_messages_so_far % 1000 == 0 {
            println!("Total Messages: {}", total_messages_so_far);
        }

        let _ = msg.gen_text(&db);

        // convert the Unix timestamp to a NaiveDateTime object
        let date = msg.date;

        // convert the NaiveDateTime object to a string
        let date_str = format(&msg.date(&get_offset()));

        // get the chatroom from the hashmap
        let chatroom = chatrooms.get(&msg.chat_id.or(Some(0)).unwrap());

        // Some({39, 77, 198})
        let this_chatroom_participants =
            chatroom_participants.get(&msg.chat_id.or(Some(0)).unwrap());

        // convert to vec of phone numbers
        let participants_addresses;

        if let Some(this_chatroom_participants) = this_chatroom_participants {
            participants_addresses = this_chatroom_participants
                .iter()
                .map(|user_id| {
                    let participant = participants.get(user_id).unwrap();
                    participant.clone()
                })
                .collect::<Vec<String>>();
        } else {
            participants_addresses = vec![];
        }

        let attachments = Attachment::from_message(&db, &msg).unwrap();

        let attachments_info_vec = attachments
            .iter()
            .map(|attachment| {
                let attachment_json = json!({
                    "filepath": attachment.filename,
                    "filename": attachment.filename(),
                    "transfer_name": attachment.transfer_name,
                    "hide_attachment": attachment.hide_attachment,
                    "mime_type": attachment.mime_type,
                    "uti": attachment.uti,
                    "total_bytes": attachment.total_bytes,
                    "is_sticker": attachment.is_sticker,
                });
                attachment_json
            })
            .collect::<Vec<Value>>();

        let mut from_address = "Me".to_string();
        if msg.is_from_me != true {
            from_address = participants.get(&msg.handle_id.unwrap()).unwrap().clone();
        }

        let message_json = json!({
            "rowid": msg.rowid,
            "guid": msg.guid,
            "text": msg.text,
            "service": msg.service,
            "handle_id": msg.handle_id,
            "from_address": from_address,
            "subject": msg.subject,
            "date": date,
            "date_str": date_str,
            "date_read": msg.date_read,
            "date_delivered": msg.date_delivered,
            "is_from_me": msg.is_from_me,
            "is_read": msg.is_read,
            "item_type": msg.item_type,
            "group_title": msg.group_title,
            "group_action_type": msg.group_action_type,
            "associated_message_guid": msg.associated_message_guid,
            "associated_message_type": msg.associated_message_type,
            "balloon_bundle_id": msg.balloon_bundle_id,
            "expressive_send_style_id": msg.expressive_send_style_id,
            "thread_originator_guid": msg.thread_originator_guid,
            "thread_originator_part": msg.thread_originator_part,
            "date_edited": msg.date_edited,
            "chat_id": msg.chat_id,
            "deleted_from": msg.deleted_from,
            "num_replies": msg.num_replies,
            //
            "num_attachments": msg.num_attachments,
            // map the attachments to a json object
            "attachments": attachments_info_vec,
        });

        if let Some(chat_id) = msg.chat_id {
            if let Some(chatroom) = chatroom {
                if !chatrooms_with_messages.contains_key(&chat_id) {
                    let chatroom_obj = json!({
                        "chat_id": chat_id,
                        "chat_identifier": chatroom.chat_identifier.clone(),
                        "service_name": chatroom.service_name.clone(),
                        "display_name": chatroom.display_name.clone(),
                        "rowid": chatroom.rowid,
                        "participants": participants_addresses,
                        "real_id": real_chatrooms.get(&chat_id),
                        "messages": [message_json],
                    });

                    chatrooms_with_messages.insert(chat_id, chatroom_obj);
                } else {
                    if let Some(chatroom) = chatrooms_with_messages.get_mut(&chat_id) {
                        if let Some(Value::Array(this_chatroom_messages)) =
                            chatroom.get_mut("messages")
                        {
                            // if max_messages_per_group is set, only add the message if the number of messages in the group is less than max_messages_per_group
                            if max_messages_per_group.is_none()
                                || this_chatroom_messages.len()
                                    < max_messages_per_group.unwrap() as usize
                            {
                                this_chatroom_messages.push(message_json);
                            }
                        }
                    }
                }
            }
        }
    }

    // now re-reverse all the messages
    if max_messages_per_group.is_some() {
        for (_, chatroom) in chatrooms_with_messages.iter_mut() {
            if let Some(Value::Array(messages)) = chatroom.get_mut("messages") {
                messages.reverse();
            }
        }
    }

    // convert chatrooms_with_messages to json
    let chatrooms_with_messages_json = serde_json::to_string(&chatrooms_with_messages).unwrap();

    // return the json string
    Ok(chatrooms_with_messages_json)
}

#[allow(dead_code)]
fn main() {
    // get the messages as a json string
    let messages_json = get_messages_json(
        "/Users/hunterunger/Library/Messages/chat.db",
        "2021-01-01 00:00:00",
        "2021-01-31 23:59:59",
        None,
        None,
    )
    .unwrap();

    // save the json string to a file
    let _ = std::fs::write("messages.json", messages_json);
}
