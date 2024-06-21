export interface ContactCard {
    first?: string;
    last?: string;
    organization?: string;
    emails?: string[];
    birthday?: string;
    phones?: string[];
    UID: string;
}

export function cleanAddressBookPlist(plistData: any): ContactCard {
    const cleanedItem: ContactCard = {
        first: plistData.First,
        organization: plistData.Organization,
        last: plistData.Last,
        emails: plistData.Email?.values,
        birthday: plistData.Birthday,
        phones: plistData.Phone?.values,
        UID: plistData.UID,
    };

    return cleanedItem;
}
