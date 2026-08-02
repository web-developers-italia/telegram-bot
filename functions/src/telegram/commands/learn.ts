import { staticCommand } from "../CommandsProtocol.js";

const text = `Sei nuovo nel mondo del Web development?
- https://roadmap.sh/
- http://jsforcats.com/
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- https://github.com/getify/You-Dont-Know-JS
- https://github.com/EbookFoundation/free-programming-books

Piattaforme di e-learning:
- https://www.freecodecamp.org/
- https://www.codecademy.com/
- https://www.codewars.com/`;

export const learn = staticCommand(["/learn"], text, {
	preferRepliedMessage: true,
});
