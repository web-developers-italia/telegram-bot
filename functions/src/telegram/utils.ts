import { fetch } from 'undici'

export const addUsernameCommand = (command: string) => [
  command,
  `${command}@${process.env.TELEGRAM_BOT_USERNAME}`,
];

export const getDataFromGithub = async (type: string) => {
  const res = await fetch(`https://api.github.com/repos/${process.env.REPOSITORY_NAME}${type}`)
  const json = await res.json() 

  return JSON.stringify(json);
};

export const parseGithubResponse = async (response: string | PromiseLike<string>) => {
  const json = JSON.parse(await response);
  let list: string[] = [];
  for(let key in json) {
    let link: string = json[key].html_url;
    let title: string = json[key].title;
    list.push(`[${title}](${link})`.replaceAll('.', '\\.').replaceAll('-', '\\-'));
 }

 return list;
};

export const getPullRequests = async () => {
  const response = await getDataFromGithub("/pulls?state=open");
  return parseGithubResponse(response);
}

export const getIssues = async () => {
  const response = await getDataFromGithub("/issues?state=open");
  return parseGithubResponse(response);
}
