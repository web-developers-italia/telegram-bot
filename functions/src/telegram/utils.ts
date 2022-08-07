import { fetch } from 'undici'

export const addUsernameCommand = (command: string) => [
  command,
  `${command}@${process.env.TELEGRAM_BOT_USERNAME}`,
];

export const getRequest = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json() 

  return JSON.stringify(json);
};

export const getListGithub = async (url: string) => {
  const json = JSON.parse(await getRequest(url));
  let list: string[] = [];
  for(let key in json) {
    let link: string = json[key].html_url;
    let title: string = json[key].title;
    list.push(`[${title}](${link})`.replaceAll('.', '\\.').replaceAll('-', '\\-'));
 }

 return list;
};