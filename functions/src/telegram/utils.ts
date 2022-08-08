export const addUsernameCommand = (command: string) => [
  command,
  `${command}@${process.env.TELEGRAM_BOT_USERNAME}`,
];
