# Unraid API LXC Container Support Research

**Date:** 2026-02-28
**Status:** Not Supported

## Summary

The Unraid GraphQL API does **not** currently support managing LXC containers. LXC functionality is only available through a community plugin and is not exposed via the official API.

## Detailed Findings

### Unraid GraphQL API Schema

The official Unraid API ([github.com/unraid/api](https://github.com/unraid/api)) `generated-schema.graphql` contains zero references to LXC, sandbox containers, or system containers. Container management is limited to Docker:

**Supported container/VM operations:**

| Resource | Operations |
|---|---|
| Docker Containers | List, start, stop, pause, unpause, remove, autostart config |
| Virtual Machines | List, start, stop, pause, resume, force stop |
| LXC Containers | **Not supported** |

### API Roadmap

The Unraid API roadmap ([docs.unraid.net/API/upcoming-features](https://docs.unraid.net/API/upcoming-features/)) does not include LXC support as a planned or upcoming feature. The 2026 roadmap focuses on:
- Internal boot support
- Multiple arrays
- General API improvements
- WebGUI modernization

### LXC on Unraid

LXC is available on Unraid **only** through the community plugin [ich777/unraid-lxc-plugin](https://github.com/ich777/unraid-lxc-plugin). This plugin:
- Operates outside the official GraphQL API
- Has a large community following (850+ replies, 137k+ views on the [forum thread](https://forums.unraid.net/topic/123935-plugin-lxc-plugin/))
- Supports GPU passthrough (NVIDIA/AMD), running Docker inside LXC, and migration from Proxmox
- Is managed via the Unraid WebGUI plugin interface and `lxc-*` CLI tools

### Implications for This Provider

Adding LXC container management to this Pulumi provider would require one of:

1. **Wait for official API support** — Unraid would need to add LXC queries/mutations to their GraphQL schema. This is not currently on their roadmap.

2. **Shell-based approach** — Bypass the GraphQL API and interact with LXC directly via SSH/shell commands (`lxc-create`, `lxc-start`, `lxc-stop`, `lxc-ls`, etc.). This would be architecturally different from the rest of the provider which uses GraphQL exclusively.

3. **Plugin API** — If the LXC plugin exposes its own API endpoints, those could potentially be consumed. However, no such API has been documented.

## Sources

- [Unraid API Documentation](https://docs.unraid.net/API/)
- [Unraid API GitHub Repository](https://github.com/unraid/api)
- [Unraid API Roadmap](https://docs.unraid.net/API/upcoming-features/)
- [LXC Plugin Forum Thread](https://forums.unraid.net/topic/123935-plugin-lxc-plugin/)
- [LXC Plugin GitHub](https://github.com/ich777/unraid-lxc-plugin)
