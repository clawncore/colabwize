import React, { useState, useEffect } from "react";
import encryptionService from "../../services/encryptionService";
import { Notification } from "../../services/notificationService";

interface NotificationMessageProps {
  notification: Notification;
  className?: string;
}

export const NotificationMessage: React.FC<NotificationMessageProps> = ({
  notification,
  className = "",
}) => {
  const [displayText, setDisplayText] = useState(notification.message);
 
  useEffect(() => {
    const decryptContent = async () => {
      // Only attempt decryption for chat-related notifications with encrypted content
      const encryptedContent = notification.data?.encryptedContent;
      const contextId =
        notification.data?.workspaceId ||
        notification.data?.projectId ||
        "global";

      if (
        encryptedContent &&
        (notification.type === "mention" || notification.type === "comment")
      ) {
        try {
          const decrypted = await encryptionService.decrypt(
            encryptedContent,
            contextId,
          );

          // Format: "Sender name: Decrypted Message"
          // The backend sends message as "Sender name: \"Encrypted...\""
          // We want to reconstruct it as "Sender name: Decrypted..."
          const senderPart = notification.message.split(":")[0];
          if (senderPart && senderPart !== notification.message) {
            setDisplayText(`${senderPart}: ${decrypted}`);
          } else {
            setDisplayText(decrypted);
          }
        } catch (err) {
          console.error("Failed to decrypt notification message:", err);
          // Fallback to original message is already handled by initial state
        }
      } else {
        // Not a chat notification or no encrypted content available
        setDisplayText(notification.message);
      }
    };

    decryptContent();
  }, [notification]);

  return <p className={className}>{displayText}</p>;
};

export default NotificationMessage;
