export default function cleanPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    return phoneNumber.replace(/\D/g, "");
}
