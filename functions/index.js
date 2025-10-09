const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// This automatically picks up credentials when deployed to Cloud Functions
admin.initializeApp();

// Export a callable Cloud Function
// Callable functions are designed to be invoked directly from your client-side code
// and automatically provide the authenticated user's context.
exports.addChildAccount = functions.https.onCall(async (data, context) => {
  // 1. Authenticate the caller (ensure a parent is logged in)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const parentUid = context.auth.uid; // The UID of the parent calling this function

  // 2. Validate input from the client
  const { childEmail, childPassword, childDisplayName } = data;

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

  // 3. Create the child user using Firebase Admin SDK
  let childUid;
  try {
    const userRecord = await admin.auth().createUser({
      email: childEmail,
      password: childPassword,
      displayName: childDisplayName,
      // You can also set photoURL, phoneNumber, etc.
      // Set emailVerified: true if you don't want children to verify their emails
      emailVerified: true, // Or false, depending on your flow
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
    // Re-throw other authentication errors
    throw new functions.https.HttpsError(
      "internal",
      `Error creating child user: ${error.message}`,
      error
    );
  }

  // 4. Update Realtime Database with child profile and link to parent
  const db = admin.database(); // Get Realtime Database reference

  const updates = {};
  // Set child's profile
  updates[`/childrenProfiles/${childUid}`] = {
    parentUid: parentUid,
    displayName: childDisplayName,
    email: childEmail,
    points: 0, // Initialize points for the child
  };
  // Link child to parent's list
  updates[`/users/${parentUid}/children/${childUid}`] = true;

  try {
    await db.ref().update(updates);
    console.log(
      `Realtime Database updated for child: ${childUid} and parent: ${parentUid}`
    );
  } catch (error) {
    // If database update fails, consider if you want to delete the auth user
    // or log an admin alert. For simplicity, we'll just throw the error.
    throw new functions.https.HttpsError(
      "internal",
      `Error updating Realtime Database: ${error.message}`,
      error
    );
  }

  // 5. Return success message (optional, but good for client feedback)
  return { success: true, childUid: childUid };
});
