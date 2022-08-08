import { Octokit } from "octokit";

export const addUsernameCommand = (command: string) => [
  command,
  `${command}@${process.env.TELEGRAM_BOT_USERNAME}`,
];

export const escapeForTelegram = (text: string) => {
  const toEscape: string[] = [".", "-", "#"];

  return toEscape.reduce((finalString: string, char: string) => {
    return finalString.replaceAll(char, `\\${char}`);
  }, text);
};

const octokit = new Octokit();

export const getPullRequests: () => Promise<
  {
    number: number;
    title: string;
    html_url: string;
  }[]
> = async () => {
  const prs = await octokit.request(
    `GET /repos/${process.env.ORG_NAME}/${process.env.REPOSITORY_NAME}/pulls`,
    {
      owner: process.env.ORG_NAME || "web-developers-italia",
      repo: process.env.REPOSITORY_NAME || "telegram-bot",
    }
  );

  return prs.data.map(
    ({
      number,
      title,
      html_url,
    }: {
      number: number;
      title: string;
      html_url: string;
    }) => ({ number, title, html_url })
  );
};

export const getIssues: () => Promise<
  {
    number: number;
    title: string;
    html_url: string;
  }[]
> = async () => {
  const issues = await octokit.request(
    `GET /repos/${process.env.ORG_NAME}/${process.env.REPOSITORY_NAME}/issues`,
    {
      owner: process.env.ORG_NAME || "web-developers-italia",
      repo: process.env.REPOSITORY_NAME || "telegram-bot",
    }
  );

  return issues.data.map(
    ({
      number,
      title,
      html_url,
    }: {
      number: number;
      title: string;
      html_url: string;
    }) => ({
      number,
      title,
      html_url,
    })
  );
};
