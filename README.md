# BioMCP

A collection of MCP servers for biological and biomedical databases including
PubMed Central, QuickGo, PlasmoDB, and more.

## Quick Start

### Streamable HTTP (Recommended)

```bash
deno run -A server.ts
# or
PORT=8000 deno run -A server.ts
```

Then configure the MCP servers' URLs to:

- `http://localhost:8000/pubmed`
- `http://localhost:8000/plasmodb`
- `http://localhost:8000/quickgo`

### stdio

```bash
deno run -A src/pubmed/server.ts
# or
deno run -A src/plasmodb/server.ts
# or
deno run -A src/quickgo/server.ts
```
