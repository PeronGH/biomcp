import { Hono } from "hono";
import { createPubMedServer } from "./src/pubmed/server.ts";
import { createPlasmoDbServer } from "./src/plasmodb/server.ts";
import { createQuickGoServer } from "./src/quickgo/server.ts";
import { createMcpHandler } from "@pixel/mcp-adapter";

const PORT = Deno.env.get("PORT") || "8000";

const app = new Hono();

const pubMedHandler = createMcpHandler({ newServer: createPubMedServer });
const plasmoDbHandler = createMcpHandler({ newServer: createPlasmoDbServer });
const quickGoHandler = createMcpHandler({ newServer: createQuickGoServer });

app.post("/pubmed", (c) => pubMedHandler(c.req.raw));
app.post("/plasmodb", (c) => plasmoDbHandler(c.req.raw));
app.post("/quickgo", (c) => quickGoHandler(c.req.raw));

Deno.serve({ port: Number.parseInt(PORT) }, app.fetch);
