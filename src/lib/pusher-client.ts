import PusherClient from "pusher-js";

let pusherInstance: PusherClient | null = null;

export const getPusherClient = () => {
  if (typeof window === "undefined") return null; // Avoid SSR crashes
  
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
    console.warn("Pusher API key is missing. Live feed is disabled.");
    return null;
  }

  if (!pusherInstance) {
    pusherInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
    });
  }

  return pusherInstance;
};
