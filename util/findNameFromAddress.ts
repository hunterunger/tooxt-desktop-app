import { ContactCard } from "./addressBookTools";
import cleanPhoneNumber from "./cleanPhoneNumber";

export function findNameFromAddress(address: string, contacts: ContactCard[]) {
    const contact = contacts.find((contact) => {
        if (contact.emails && contact.emails.includes(address)) {
            return true;
        }
        if (contact.phones && isPhoneNumber(address)) {
            return contact.phones.some((phone) => {
                return (
                    cleanPhoneNumber(phone).includes(
                        cleanPhoneNumber(address)
                    ) ||
                    cleanPhoneNumber(address).includes(cleanPhoneNumber(phone))
                );
            });
        }
        return false;
    });

    if (contact) {
        if (contact.first && contact.last) {
            return contact.first + " " + contact.last;
        } else if (contact.first) {
            return contact.first;
        } else if (contact.organization) {
            return contact.organization;
        }
    }

    return null;
}

function isPhoneNumber(str: string) {
    return str.match(/^\+?[0-9]+$/) !== null;
}
