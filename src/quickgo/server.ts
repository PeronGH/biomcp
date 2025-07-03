import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE_URL = "https://www.ebi.ac.uk/QuickGO/services";

function callApi(
  method: "GET" | "POST",
  path: string,
  payload: Record<string, unknown> = {},
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

export function createQuickGoServer(): McpServer {
  const server = new McpServer({
    name: "quickgo",
    version: "1.0.0",
  });

  // GET /ontology/go/search
  server.registerTool("search", {
    title: "Search Ontology Terms",
    description:
      "Searches a simple user query, e.g., query=apopto. If possible, response fields include: id, name, isObsolete, aspect (for GO).",
    inputSchema: {
      query: z
        .string()
        .describe("Some value to search for in the ontology."),
      limit: z
        .number()
        .int()
        .min(1)
        .max(600)
        .default(25)
        .describe("The number of results per page [1-600]."),
      page: z
        .number()
        .int()
        .positive()
        .default(1)
        .describe("The results page to retrieve."),
    },
  }, async ({ query, limit, page }) => ({
    content: [{
      type: "text",
      text: await callApi("GET", "/ontology/go/search", { query, limit, page }),
    }],
  }));

  // GET /ontology/go/slim
  server.registerTool("getSlim", {
    title: "Get Ontology Slim",
    description:
      "Gets slimming information for the provided slim-set, where the slims can be reached only via the provided relationships.",
    inputSchema: {
      slimsToIds: z
        .string()
        .array()
        .min(1)
        .transform((ids) => ids.join(","))
        .describe(
          "A list of term IDs forming the 'slim-set'.",
        ),
      slimsFromIds: z
        .string()
        .array()
        .optional()
        .transform((ids) => ids?.join(",") ?? "")
        .describe(
          "A list of term IDs from which slimming information is applied.",
        ),
      relations: z
        .string()
        .array()
        .optional()
        .transform((rels) => rels?.join(",") ?? "")
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

  // GET /ontology/go/terms/graph
  server.registerTool("getGraph", {
    title: "Get Ontology Term Graph",
    description:
      "Fetches a sub-graph of the ontology. It contains a set of vertices and edges.",
    inputSchema: {
      startIds: z
        .string()
        .array()
        .min(1)
        .transform((ids) => ids.join(","))
        .describe(
          "A list of term IDs specifying the beginning of the sub-graph.",
        ),
      stopIds: z
        .string()
        .array()
        .optional()
        .transform((ids) => ids?.join(",") ?? "")
        .describe(
          "A list of term IDs specifying the end of the sub-graph.",
        ),
      relations: z
        .string()
        .array()
        .optional()
        .transform((rels) => rels?.join(",") ?? "")
        .describe(
          "A list of relationships over which the graph will navigate.",
        ),
    },
  }, async ({ startIds, stopIds, relations }) => ({
    content: [{
      type: "text",
      text: await callApi("GET", `/ontology/go/terms/graph`, {
        startIds,
        stopIds,
        relations,
      }),
    }],
  }));

  // GET /ontology/go/terms/{ids}
  server.registerTool("getDetails", {
    title: "Get Ontology Term Details",
    description:
      "Retrieves detailed information about specified ontology terms. If possible, response fields include: id, isObsolete, name, definition, ancestors, synonyms, comment, aspect (for GO) and usage.",
    inputSchema: {
      ids: z
        .string()
        .array()
        .min(1)
        .transform((ids) => ids.join(","))
        .describe("A list of term IDs to retrieve details for."),
    },
  }, async ({ ids }) => ({
    content: [{
      type: "text",
      text: await callApi("GET", `/ontology/go/terms/${ids}`),
    }],
  }));

  // GET /ontology/go/terms/{ids}/ancestors
  server.registerTool("getAncestors", {
    title: "Get Ontology Ancestors",
    description: "Retrieves the ancestors of specified ontology terms.",
    inputSchema: {
      ids: z
        .string()
        .array()
        .min(1)
        .transform((ids) => ids.join(","))
        .describe("A list of term IDs to retrieve ancestors for."),
    },
  }, async ({ ids }) => ({
    content: [{
      type: "text",
      text: await callApi("GET", `/ontology/go/terms/${ids}/ancestors`),
    }],
  }));

  // GET /ontology/go/terms/{ids}/children
  server.registerTool("getChildren", {
    title: "Get Ontology Children",
    description: "Retrieves the children of specified ontology terms.",
    inputSchema: {
      ids: z
        .string()
        .array()
        .min(1)
        .transform((ids) => ids.join(","))
        .describe("A list of term IDs to retrieve children for."),
    },
  }, async ({ ids }) => ({
    content: [{
      type: "text",
      text: await callApi("GET", `/ontology/go/terms/${ids}/children`),
    }],
  }));

  // GET /ontology/go/terms/{ids}/complete
  server.registerTool("getComplete", {
    title: "Get Complete Ontology Term",
    description:
      "Retrieves complete information about specified ontology terms, including all relationships and properties.",
    inputSchema: {
      ids: z
        .string()
        .array()
        .min(1)
        .transform((ids) => ids.join(","))
        .describe("A list of term IDs to retrieve complete information for."),
    },
  }, async ({ ids }) => ({
    content: [{
      type: "text",
      text: await callApi("GET", `/ontology/go/terms/${ids}/complete`),
    }],
  }));

  return server;
}

if (import.meta.main) {
  const server = createQuickGoServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
