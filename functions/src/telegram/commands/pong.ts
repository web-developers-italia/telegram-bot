import { staticCommand } from "../CommandsProtocol.js";

export const pong = staticCommand(["/ping"], "/pong 🏓", {
	description: "verifica che il bot sia vivo",
});
