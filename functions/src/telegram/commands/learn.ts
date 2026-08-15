import { staticCommand } from "../CommandsProtocol.js";

const text = `Sei nuovo nel mondo del Web development?
- https://roadmap.sh/
- https://developer.mozilla.org/en-US/docs/Learn_web_development
- https://www.theodinproject.com/
- https://www.freecodecamp.org/

Impara costruendo, non solo guardando tutorial:
- https://github.com/practical-tutorials/project-based-learning
- https://www.codewars.com/

Vuoi costruire agenti AI? (dopo le basi di programmazione)
- https://roadmap.sh/ai-agents
- https://huggingface.co/learn/agents-course/
- https://www.anthropic.com/research/building-effective-agents
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- https://docs.langchain.com/oss/python/langgraph/

Consiglio per il 2026: usa l'AI come tutor per capire il codice, non per scriverlo al posto tuo. I fondamentali contano più che mai.`;

export const learn = staticCommand(["/learn"], text, {
	preferRepliedMessage: true,
	description: "risorse per imparare web development e agenti AI",
});
