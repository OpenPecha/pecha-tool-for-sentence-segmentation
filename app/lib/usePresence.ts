import { useState, useEffect } from "react";
import Pusher from "pusher-js";

const usePusherPresence = (
  channelName: string,
  id: string,
  cluster: string,
  user: any,
  text: any
) => {
  if (!text) {
    text = { id: user?.id };
  }
  const [textOnline, settextOnline] = useState([]);
  useEffect(() => {
    const pusher = new Pusher(id, {
      cluster,
      authEndpoint: "/auth/pusher",
      auth: {
        params: {
          user_id: user?.id,
          text_id: text?.id,
        },
      },
      // Replace with your server's auth endpoint
    });
    const channel = pusher.subscribe(channelName);

    const handleSubscriptionSucceeded = () => {
      settextOnline(Object.entries(channel.members.members));
    };

    const handleMemberAdded = (member) => {
      settextOnline(Object.entries(channel.members.members));
    };

    const handleMemberRemoved = (member) => {
      settextOnline(Object.entries(channel.members.members));
    };

    channel.bind("pusher:subscription_succeeded", handleSubscriptionSucceeded);
    channel.bind("pusher:member_added", handleMemberAdded);
    channel.bind("pusher:member_removed", handleMemberRemoved);

    return () => {
      channel.unbind();
      pusher.unsubscribe(channelName);
    };
  }, [channelName, user]);
  return { textOnline };
};

export default usePusherPresence;
