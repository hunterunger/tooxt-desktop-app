import {
    doc,
    getDoc,
    getFirestore,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    or,
    updateDoc,
    deleteField,
} from "firebase/firestore";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";
import { UserDataType } from "../dataTypes";
import enpoints from "@/shared/enpoints";

export async function getUserData(
    uid: string
): Promise<UserDataType | undefined> {
    /*
    This function is used to get user data from firestore.
    */

    const userDocSnapshot = doc(getFirestore(), "users", uid);
    console.log("Loading user data from firestore");
    const data = await getDoc(userDocSnapshot);
    return data.data() as UserDataType;
}

export async function setUserData(
    uid: string,
    setTo: UserDataType
): Promise<void> {
    /*
    This function is used to set user data to firestore.
    It will merge the existing user data with setTo and save it to firestore.
    */

    const userDocSnapshot = doc(getFirestore(), "users", uid);
    console.log("Saving user data to firestore");
    setDoc(userDocSnapshot, setTo, { merge: true });
}

export async function deleteProject(uid: string, projectId: string) {
    const userDocSnapshot = doc(getFirestore(), "users", uid);

    await updateDoc(userDocSnapshot, {
        ["projects." + projectId]: deleteField(),
    })
        .then(() => {
            console.log("Project Firestore deleted");
            // now delete stored images
            fetch(enpoints.rmProject, {
                method: "POST",
                body: JSON.stringify({
                    projectId,
                    uid,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => {
                    console.log("Project storage deleted", res);
                })
                .catch((e) => {
                    console.error("Error deleting project", e);
                });
        })
        .catch((e) => {
            console.error("Error deleting project", e);
        });
}

export async function uploadProjectPhoto(
    imageStr: string,
    filename: string,
    projectId: string,
    idToken: string,
    options?: {
        width?: number | null;
        quality?: number;
    }
) {
    let uploadReq = await fetch(enpoints.uploadImage1bgMem, {
        method: "POST",
        body: JSON.stringify({
            image: imageStr,
            filename,
            projectId,
            ...options,
        }),

        headers: {
            "Content-Type": "application/json",
            authorization: `${idToken}`,
        },
    });

    const uploadRes: {
        savePath: string;
    } = await uploadReq.json();

    return uploadRes;
}

export async function getListings(uid: string | undefined) {
    const db = getFirestore();

    let q = query(collection(db, "listings"), where("access", "==", "public"));
    if (uid) {
        q = query(
            collection(db, "listings"),
            or(where("owner", "==", uid), where("access", "==", "public"))
        );
    }

    const querySnapshot = await getDocs(q);

    const listings: any[] = [];
    querySnapshot.forEach((doc) => {
        listings.push({
            ...doc.data(),
            docId: doc.id,
        });
    });

    return listings;
}

export async function addListing(listing: any) {
    const db = getFirestore();

    const docRef = await addDoc(collection(db, "listings"), listing);

    return docRef;
}

export async function deleteListing(docId: string) {
    const db = getFirestore();

    console.log("Deleting listing with docId: ", docId);

    await deleteDoc(doc(db, "listings", docId));
}

export async function uploadImage(file: File, uid: string): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, `users/${uid}/${file.name}`);

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                // You can use this section to display the upload progress
            },
            (error) => {
                // Handle unsuccessful uploads
                reject(error);
            },
            () => {
                // Handle successful uploads on complete
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
}

export async function getStorageImageUrl(path: string): Promise<string> {
    // Create a storage reference
    const storage = getStorage();

    const storageRef = ref(storage, `${path}`);

    const url = await getDownloadURL(storageRef);

    return url;
}
