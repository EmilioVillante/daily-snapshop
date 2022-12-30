import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, Firestore, CollectionReference } from "firebase/firestore";
import {SnapshotModel} from "@/types/snapshot";

let app: FirebaseApp | undefined = undefined;

/**
 * Instantiate firestore and return a reference to the Index collection
 */
export default async () => {
    const config = {
        apiKey: process.env.API_KEY,
        authDomain: process.env.AUTH_DOMAIN,
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
        appId: process.env.APP_ID,
        measurementId: process.env.MEASUREMENT_ID
    };

    const collectionName: string = process.env.FIRESTORE_COLLECTION || '';

    if (!app) {
        app = initializeApp(config);
    }

    const db: Firestore = getFirestore(app);
    return collection(db, collectionName) as CollectionReference<SnapshotModel>;
}
