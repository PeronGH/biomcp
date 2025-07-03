import { Hono } from "hono";
import { createQuickGoServer } from "./src/quickgo/server.ts";
import { createMcpHandler } from "@pixel/mcp-adapter";

const app = new Hono();

const quickGoHandler = createMcpHandler({ newServer: createQuickGoServer });

app.post("/quickgo", (c) => quickGoHandler(c.req.raw));

Deno.serve(app.fetch);
