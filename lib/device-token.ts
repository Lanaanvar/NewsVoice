import { getMessaging, getToken } from "firebase/messaging";
import { app } from "./firebase";

// Call this with your VAPID key to get the device token
export async function getDeviceToken(vapidKey: string): Promise<string | null> {
  try {
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (err) {
    console.error("Error getting device token:", err);
    return null;
  }
}
