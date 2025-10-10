import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

initializeApp();

// REMOVED ALL TYPE ANNOTATIONS IN THE FUNCTION SIGNATURE AND VARIABLE DECLARATIONS
export const addChildAccount = functions.https.onCall(
  async (firstArgumentFromRuntime, secondArgumentFromRuntime) => {
    console.log("--- START FUNCTION LOG ---");

    // Based on logs, firstArgumentFromRuntime is the actual CallableContext
    // Removed explicit type annotation for 'context' to avoid SyntaxError
    const context = firstArgumentFromRuntime;
    // And the client's data payload is expected to be ON that context object
    const clientPayload = context.data;

    console.log("Actual CallableContext (from first arg):", context);
    console.log("Client data payload (from context.data):", clientPayload); // THIS is what should be your form data

    // For debugging, we can still log the second argument if it helps understanding further:
    console.log(
      "Type of 'secondArgumentFromRuntime':",
      typeof secondArgumentFromRuntime
    );
    console.log(
      "Content of 'secondArgumentFromRuntime':",
      secondArgumentFromRuntime
    );

    // --- Auth Context Check ---
    // The 'context' variable here is now the actual CallableContext object
    if (!context || !context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated. (Debug: Auth context not found in the first argument.)"
      );
    }

    // Auth context is now correctly available
    console.log("context.auth IS present. UID:", context.auth.uid);
    // Re-added JSON.stringify for context.auth.token for clarity in logs, as it's a known safe object.
    console.log(
      "context.auth.token (claims):",
      JSON.stringify(context.auth.token, null, 2)
    );

    // --- Begin Business Logic ---
    const parentUid = context.auth.uid;

    // Now, destructure the actual clientPayload
    const { childEmail, childPassword, childDisplayName } = clientPayload;

    if (!childEmail || !childPassword || !childDisplayName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        'The function must be called with "childEmail", "childPassword", and "childDisplayName".'
      );
    }
    if (childPassword.length < 6) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The child password must be at least 6 characters long."
      );
    }

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
      console.log(
        `Successfully created new child user: ${childUid} for parent: ${parentUid}`
      );
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
      console.log(
        `Realtime Database updated for child: ${childUid} and parent: ${parentUid}`
      );
    } catch (error) {
      throw new functions.https.HttpsError(
        "internal",
        `Error updating Realtime Database: ${error.message}`,
        error
      );
    }

    console.log("--- END FUNCTION LOG ---");
    return { success: true, childUid: childUid };
  }
);
