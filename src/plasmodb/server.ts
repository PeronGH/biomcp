import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ORGANISMS } from "./constants.ts";

const API_BASE_URL = "https://plasmodb.org/plasmo/service";

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

export function createPlasmoDbServer(): McpServer {
  const server = new McpServer({
    name: "plasmodb",
    version: "1.0.0",
  });

  server.registerTool("searchGene", {
    title: "Search Gene",
    description: "Search for a gene in PlasmoDB",
    inputSchema: {
      textExpression: z
        .string()
        .describe(
          "The text expression to search for a gene. use * as wildcard.",
        ),
      organisms: z
        .string()
        .array()
        .default(ORGANISMS)
        .describe(
          "Filter by organisms. Should be a subset of the default list. If unspecified, all organisms are used.",
        ),
    },
  }, async ({ textExpression, organisms }) => ({
    content: [{
      type: "text",
      text: await callApi(
        "POST",
        "/record-types/transcript/searches/GenesByText/reports/standard",
        {
          "searchConfig": {
            "parameters": {
              "text_search_organism": JSON.stringify(organisms),
              "text_expression": textExpression,
              "document_type": "gene",
              "text_fields": JSON.stringify([
                "organism_full",
                "primary_key",
                "name",
                "Alias",
                "product",
                "Products",
              ]),
            },
            "wdkWeight": 10,
          },
          "reportConfig": {
            "attributes": [
              "primary_key",
              "organism",
              "gene_location_text",
              "gene_product",
              "max_score",
            ],
            "tables": [],
            "attributeFormat": "text",
          },
        },
      ),
    }],
  }));

  return server;
}

if (import.meta.main) {
  const server = createPlasmoDbServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
