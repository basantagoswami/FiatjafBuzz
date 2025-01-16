import { getPublicKey, kinds, nip19 } from "nostr-tools";
import { SimplePool, useWebSocketImplementation } from "nostr-tools/pool";
import { finalizeEvent } from "nostr-tools/pure";
import { config } from "dotenv";
import WebSocket from "ws";

useWebSocketImplementation(WebSocket);
config();

const binaryPrivateKey = nip19.decode(process.env.BOT_NSEC).data;
const relayUrls = process.env.RELAY_URLS.split(",");

const pool = new SimplePool();

const getMessage = () => {
  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  
  if (isWeekend) {
    return "gfy fiatjaf";
  }

  const isOddDay = today.getDate() % 2 === 1;

  return isOddDay ? "GM fiatjaf" : "null";
};

const postMessage = async () => {
  const message = getMessage();
  
  if (!message) {
    console.log("No message to post today.");
    process.exit(0);
    return;
  }

  try {
    const event = finalizeEvent(
      {
        kind: kinds.ShortTextNote,
        pubkey: getPublicKey(binaryPrivateKey),
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: message
      },
      binaryPrivateKey
    );

    await Promise.any(pool.publish(relayUrls, event));
    console.log(`Post sent successfully: "${message}"`);
  } catch (error) {
    console.error("Error posting message:", error);
  } finally {
    pool.close(relayUrls);
    process.exit(0);
  }
};

postMessage();
