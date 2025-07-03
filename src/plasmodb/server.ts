import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export function createPlasmoDbServer(): McpServer {
  const server = new McpServer({
    name: "plasmodb",
    version: "1.0.0",
  });

  return server;
}

if (import.meta.main) {
  const server = createPlasmoDbServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
