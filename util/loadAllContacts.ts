import { BaseDirectory, readBinaryFile, readDir } from "@tauri-apps/api/fs";
import { parseBuffer } from "@/util/bplistParser";
import { cleanAddressBookPlist, ContactCard } from "@/util/addressBookTools";

export async function loadAllContacts(): Promise<ContactCard[]> {
    const addressBookPath = "Library/Application Support/AddressBook/Sources";

    const af = await readDir(addressBookPath, {
        dir: BaseDirectory.Home,
    });

    const contactAccountsDirs = af.filter((f) => f.children);

    const allContacts: ContactCard[] = [];

    for (const contactAccountsDir of contactAccountsDirs) {
        const f = await readDir(
            addressBookPath + "/" + contactAccountsDir.name,
            {
                dir: BaseDirectory.Home,
            }
        );
        const accountsWithMetadata = f.filter((f) => f.name === "Metadata");

        for (const accountWithMetadata of accountsWithMetadata) {
            const f = await readDir(
                addressBookPath +
                    "/" +
                    contactAccountsDir.name +
                    "/" +
                    accountWithMetadata.name,
                {
                    dir: BaseDirectory.Home,
                }
            );
            const contacts = f.filter((f) => f.name?.includes(".abcdp"));

            if (contacts.length === 0) continue;

            for (const contact of contacts) {
                const f = await readBinaryFile(
                    addressBookPath +
                        "/" +
                        contactAccountsDir.name +
                        "/" +
                        accountWithMetadata.name +
                        "/" +
                        contact.name,
                    {
                        dir: BaseDirectory.Home,
                    }
                );
                // convert Uint8Array to readable buffer
                const buffer = Buffer.from(f);

                const parsed = parseBuffer(buffer);

                allContacts.push(cleanAddressBookPlist(parsed[0]));
            }
        }
    }

    return allContacts;
}
