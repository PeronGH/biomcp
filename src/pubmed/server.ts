import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { convertToMarkdown } from "@pixel/bioc2md";

export function createPubMedServer(): McpServer {
  const server = new McpServer({
    name: "pubmed",
    version: "1.0.0",
  });

  server.registerTool(
    "getFullText",
    {
      title: "Get Full Text",
      description:
        "Retrieves the full text of a PubMed article in Markdown format. Recommended over BioC JSON format unless you need comprehensive metadata.",
      inputSchema: {
        pmid: z.string().describe("The PubMed ID of the article to retrieve."),
      },
    },
    async ({ pmid }) => ({
      content: [{
        type: "text",
        text: await fetch(
          `https://www.ncbi.nlm.nih.gov/research/bionlp/RESTful/pmcoa.cgi/BioC_json/${pmid}/unicode`,
        )
          .then((res) => res.json())
          .then((data) => convertToMarkdown(data[0].documents[0])),
      }],
    }),
  );

  server.registerTool(
    "getFullTextJson",
    {
      title: "Get Full Text in BioC JSON",
      description:
        "Retrieves the full text of a PubMed article in BioC JSON format.",
      inputSchema: {
        pmid: z.string().describe("The PubMed ID of the article to retrieve."),
      },
    },
    async ({ pmid }) => ({
      content: [{
        type: "text",
        text: await fetch(
          `https://www.ncbi.nlm.nih.gov/research/bionlp/RESTful/pmcoa.cgi/BioC_json/${pmid}/unicode`,
        ).then((res) => res.text()),
      }],
    }),
  );

  return server;
}

if (import.meta.main) {
  const server = createPubMedServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
