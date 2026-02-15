import { ChatContainer } from "@/components/chat/chat-container";

/**
 * Home page - renders the full chat interface.
 * WHY: The chat IS the product. The landing page is replaced
 * with the ChatContainer which handles all states:
 * - Empty: shows welcome screen with suggestion chips
 * - Active: shows messages, food cards, typing indicator
 * - Error: shows error in chat flow (not a separate error page)
 */
export default function Home() {
  return <ChatContainer />;
}
