import Pusher from "pusher";
async function getter(
  APP_ID: string,
  KEY: string,
  SECRET: string,
  CLUSTER: string
) {
  const pusher: Pusher = new Pusher({
    appId: APP_ID!,
    key: KEY!,
    secret: SECRET!,
    cluster: CLUSTER!,
    useTLS: true,
  });

  let channel = await pusher.get({
    path: `/channels/presence-text-${process.env.NODE_ENV}/users`,
    params: {},
  });
  let presence = await channel.json();
  let { users: activeText } = presence;
  return activeText;
}
async function getPusher(
  APP_ID: string,
  KEY: string,
  SECRET: string,
  CLUSTER: string
) {
  const pusher: Pusher = new Pusher({
    appId: APP_ID!,
    key: KEY!,
    secret: SECRET!,
    cluster: CLUSTER!,
    useTLS: true,
  });
  return pusher;
}
export { getter, getPusher };
