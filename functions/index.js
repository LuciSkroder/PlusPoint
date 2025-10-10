import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

initializeApp();

export const addChildAccount = functions.https.onCall(
  async (firstArgFromRuntime, secondArgFromRuntime) => {
    // --- Core Logic: Argument Re-assignment based on observed behavior ---
    // In your environment, the first argument is consistently the CallableContext.
    // The client's payload is found within this context object's 'data' property.
    // The second argument seems to be some other internal object.

    const context = firstArgFromRuntime; // This is the actual CallableContext object (contains .auth and .data)
    const clientPayload = context.data; // This is the actual data sent from your web app

    // Optional: You can still log these for diagnostic purposes if needed in the future,
    // but they are not part of the standard execution path now.
    // console.log("Debug: secondArgFromRuntime type:", typeof secondArgFromRuntime);
    // console.log("Debug: secondArgFromRuntime content:", secondArgFromRuntime);

    // 1. Authenticate the caller
    if (!context || !context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated. (Auth context not found in expected argument.)"
      );
    }

    const parentUid = context.auth.uid; // The UID of the parent calling this function

    // 2. Validate input from the client
    const { childEmail, childPassword, childDisplayName } = clientPayload; // Use clientPayload here

    if (!childEmail || !childPassword || !childDisplayName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        'The function must be called with "childEmail", "childPassword", and "childDisplayName" in the request data.'
      );
    }
    if (childPassword.length < 6) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The child password must be at least 6 characters long."
      );
    }

    // 3. Create the child user using Firebase Admin SDK
    let childUid;
    try {
      const auth = getAuth();
      const userRecord = await auth.createUser({
        email: childEmail,
        password: childPassword,
        displayName: childDisplayName,
        emailVerified: true,
      });
      childUid = userRecord.uid;
    } catch (error) {
      if (error.code === "auth/email-already-exists") {
        throw new functions.https.HttpsError(
          "already-exists",
          "The provided email is already in use by an existing user."
        );
      }
      throw new functions.https.HttpsError(
        "internal",
        `Error creating child user: ${error.message}`,
        error
      );
    }

    // 4. Update Realtime Database with child profile and link to parent
    const db = getDatabase();

    const updates = {};
    updates[`/childrenProfiles/${childUid}`] = {
      parentUid: parentUid,
      displayName: childDisplayName,
      email: childEmail,
      points: 0,
    };
    updates[`/users/${parentUid}/children/${childUid}`] = true;

    try {
      await db.ref().update(updates);
    } catch (error) {
      throw new functions.https.HttpsError(
        "internal",
        `Error updating Realtime Database: ${error.message}`,
        error
      );
    }

    // 5. Return success message
    return { success: true, childUid: childUid };
  }
);
