import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE_URL = "https://www.ebi.ac.uk/QuickGO/services";

function callApi(
  method: "GET" | "POST",
  path: string,
  payload: Record<string, unknown>,
): Promise<string> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (method === "GET") {
    Object.entries(payload).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
    return fetch(url).then((res) => res.text());
  }
  return fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then((res) => res.text());
}

export const server = new McpServer({
  name: "quickgo",
  version: "1.0.0",
});

server.registerTool("search", {
  title: "Search Ontology Terms",
  description: "Searches a simple user query, e.g., query=apopto",
  inputSchema: {
    query: z.string().describe("Some value to search for in the ontology"),
    limit: z.number()
      .int()
      .min(1)
      .max(600)
      .default(25)
      .describe("The number of results per page [1-600]"),
    page: z.number()
      .int()
      .positive()
      .default(1)
      .describe("The results page to retrieve"),
  },
}, async ({ query, limit, page }) => ({
  content: [{
    type: "text",
    text: await callApi("GET", "/ontology/go/search", { query, limit, page }),
  }],
}));

server.registerTool("getSlim", {
  title: "Get Ontology Slim",
  description:
    "Gets slimming information for the provided slim-set, where the slims can be reached only via the provided relationships",
  inputSchema: {
    slimsToIds: z
      .string()
      .array()
      .transform((ids) => ids.join(","))
      .describe(
        "A list of term IDs forming the 'slim-set'",
      ),
    slimsFromIds: z
      .string()
      .array()
      .transform((ids) => ids.join(","))
      .describe(
        "A list of term IDs from which slimming information is applied",
      ),
    relations: z
      .string()
      .array()
      .transform((rels) => rels.join(","))
      .describe(
        "The relationships over which the slimming information is computed",
      ),
  },
}, async ({ slimsToIds, slimsFromIds, relations }) => ({
  content: [{
    type: "text",
    text: await callApi("GET", "/ontology/go/slim", {
      slimsToIds,
      slimsFromIds,
      relations,
    }),
  }],
}));

if (import.meta.main) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
