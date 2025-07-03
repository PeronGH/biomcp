import { Hono } from "hono";
import { createQuickGoServer } from "./src/quickgo/server.ts";
import { createMcpHandler } from "@pixel/mcp-adapter";

const PORT = Deno.env.get("PORT") || "8000";

const app = new Hono();

const quickGoHandler = createMcpHandler({ newServer: createQuickGoServer });

app.post("/quickgo", (c) => quickGoHandler(c.req.raw));

Deno.serve({ port: Number.parseInt(PORT) }, app.fetch);
