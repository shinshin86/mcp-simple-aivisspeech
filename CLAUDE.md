# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that bridges AivisSpeech text-to-speech engine with MCP clients. The server exposes TTS functionality through standardized MCP tools and handles cross-platform audio playback.

## Core Architecture

### Two-Layer Design
- **MCP Server Layer** (`src/index.ts`): Implements MCP protocol, handles tool requests, manages audio playback
- **API Client Layer** (`src/aivisspeech-client.ts`): Abstracts AivisSpeech Engine HTTP API

### Key Components
- **Server**: Uses `@modelcontextprotocol/sdk` with stdio transport
- **Client**: Axios-based HTTP client for AivisSpeech Engine API
- **Audio System**: Cross-platform audio playback (afplay/powershell/aplay)
- **Tool Handlers**: Four main tools exposed via MCP protocol

### Data Flow
1. MCP client requests → stdio transport → tool handler
2. Tool handler → AivisSpeechClient → HTTP API
3. Audio data → temporary file → platform-specific player
4. Response back through MCP transport

## Essential Commands

### Development
```bash
npm run dev          # Run with hot reload using tsx
npm run build        # Compile TypeScript to dist/
npm start           # Run compiled server
```

### Code Quality
```bash
npm run lint        # ESLint on src/**/*.ts
npm test           # Vitest tests (single run)
npm run test:watch # Vitest in watch mode
npm run test:ui    # Vitest with UI
npm run test:coverage # Tests with coverage report
```

### Testing Individual Files
```bash
npx vitest run tests/aivisspeech-client.test.ts
# Or run in watch mode
npx vitest watch tests/aivisspeech-client.test.ts
```

## Environment & Dependencies

### Required Runtime
- Node.js 18+ (ESM modules)
- AivisSpeech Engine running on configurable port (default: 10101)

### Key Dependencies
- `@modelcontextprotocol/sdk`: MCP protocol implementation
- `axios`: HTTP client for AivisSpeech API
- `tsx`: Development hot reload
- `vitest`: Modern test runner with ESM support

### Configuration
- Environment variable: `AIVISSPEECH_URL` (defaults to `http://127.0.0.1:10101`)
- Uses stdio transport for MCP communication
- **Important**: Use IPv4 address (127.0.0.1) instead of localhost to avoid IPv6 connection issues

## Important Implementation Details

### Audio Playback Strategy
Platform detection in `playAudio()` function:
- macOS: `afplay` (built-in)
- Windows: PowerShell Media.SoundPlayer
- Linux: `aplay` (requires ALSA utils)

### Error Handling Pattern
All tool handlers follow consistent error response format with `isError: true` flag.

### Variable Naming Conflict
Be aware of parameter vs function name conflicts (e.g., `playAudio` parameter renamed to `shouldPlayAudio`).

### TypeScript Configuration
- ESM modules with Node resolution
- Strict mode enabled
- Source maps and declarations generated
- Tests excluded from compilation

## MCP Tools Structure

The server exposes four tools through the MCP protocol:
1. `speak` - Core TTS with configurable parameters
2. `get_speakers` - Speaker enumeration
3. `notify_completion` - Task completion notifications
4. `check_engine_status` - Health monitoring

Each tool handler in the `CallToolRequestSchema` follows destructuring pattern for parameters with defaults.

## API Integration Notes

### AivisSpeech API Specifics
- **audio_query endpoint**: Requires `text` and `speaker` as query parameters, not in request body
- **Speaker structure**: Uses `speaker_uuid` and nested `styles` array with IDs
- **Default speaker**: ID 888753760 (Anneli ノーマル) provides reliable Japanese TTS

### Common Issues & Solutions
1. **IPv6 Connection Issues**: MCP environments may resolve `localhost` to IPv6 (::1), causing connection failures. Always use `127.0.0.1`.
2. **HTTP 422 Errors**: Ensure text is sent as query parameter, not request body.
3. **Speaker Not Found**: Use `get_speakers` tool to verify available speaker IDs and styles.

## Development Tools

### TypeScript MCP Integration
When the `lsmcp` MCP server is connected, use these LSP-based tools for code intelligence:

**Available Tools:**
- `mcp__typescript__lsmcp_move_file` - Move files and update all import statements
- `mcp__typescript__lsmcp_move_directory` - Move directories and update all imports
- `mcp__typescript__lsmcp_delete_symbol` - Delete symbols and all their references
- `mcp__typescript__lsmcp_rename_symbol` - Rename across entire codebase
- `mcp__typescript__lsmcp_get_type_at_symbol` - Get detailed type information
- `mcp__typescript__lsmcp_get_module_symbols` - List all exports from a module
- `mcp__typescript__lsmcp_search_symbols` - Fast project-wide symbol search
- `mcp__typescript__lsmcp_find_import_candidates` - Find and suggest imports
- `mcp__typescript__lsmcp_get_diagnostics` - Get TypeScript diagnostics for files

**Usage Priority:**
- Prefer these MCP tools over manual search/grep when available
- Use for refactoring operations (rename, move, delete)
- Use for type information and import management

### Code Duplication Detection
Use `similarity-ts` to detect code duplication:
```bash
similarity-ts .
```
This tool is pre-installed and helps identify refactoring opportunities.

## Task Completion Behavior
- When all tasks are completed, always use the aivisspeech mcp tool to announce "Tasks completed" via voice
- When user input or decision is needed, use the aivisspeech mcp tool to announce "Awaiting your decision" via voice

### Notification Timings
- When asking the user a question
- When all tasks are completed
- When errors or issues occur