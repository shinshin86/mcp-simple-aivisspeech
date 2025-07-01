# MCP Simple AivisSpeech

![Project Logo](./images/mcp-simple-aivisspeech_logo.png)

[English](README.md) | [日本語](README.ja.md)

> 🙏 **Special Thanks**  
> This project is based on [mcp-simple-voicevox](https://github.com/t09tanaka/mcp-simple-voicevox) by [@t09tanaka](https://github.com/t09tanaka).  
> We deeply appreciate their excellent work in creating the original MCP server for VOICEVOX, which served as the foundation for this AivisSpeech adaptation.

A Model Context Protocol (MCP) server for seamless integration with AivisSpeech text-to-speech engine. This project enables AI assistants and applications to convert text to natural-sounding Japanese speech with customizable voice parameters.

## ✨ Features

- Text-to-Speech Conversion - High-quality Japanese speech synthesis using AivisSpeech
- Multiple Voice Characters - Support for various speakers and voice styles (default: Anneli ノーマル)
- Configurable Parameters - Adjust speed, pitch, volume, and intonation
- Cross-Platform Audio - Automatic audio playback on macOS, Windows, and Linux
- Task Notifications - Voice notifications for process completion
- Easy Integration - Simple MCP protocol for AI assistant integration
- Engine Status Monitoring - Real-time status checking of AivisSpeech engine
- Smart Error Handling - Helpful error messages with speaker suggestions

## 📋 Prerequisites

- Node.js - Version 18.0.0 or higher
- AivisSpeech Engine - Running on `http://127.0.0.1:10101` (default port)
- Audio System - System audio capabilities for playback

## MCP Simple AivisSpeech Configuration

### Using Claude Code

When using Claude Code, start the MCP server manually before using it.

> Using npx ensures you always get the latest version automatically. No manual updates needed.

1. Start the AivisSpeech MCP server manually in a separate terminal from the one where you're using Claude Code

```bash
npx @shinshin86/mcp-simple-aivisspeech@latest
```

2. Register the MCP server with Claude Code

```bash
claude mcp add aivisspeech -e AIVISSPEECH_URL=http://127.0.0.1:10101 -- npx @shinshin86/mcp-simple-aivisspeech@latest
```

By default, the server is added to the local scope (current project only). To make it available across all projects, use the `-s user` option:

```bash
claude mcp add aivisspeech -s user -e AIVISSPEECH_URL=http://127.0.0.1:10101 -- npx @shinshin86/mcp-simple-aivisspeech@latest
```

You can also add voice notifications to your CLAUDE.md file to automate task completion notifications:

```md
## Task Completion Behavior
- When all tasks are completed, always use the aivisspeech mcp tool to announce "Tasks completed" via voice
- When user input or decision is needed, use the aivisspeech mcp tool to announce "Awaiting your decision" via voice

### Notification Timings
- When asking the user a question
- When all tasks are completed
- When errors or issues occur
```

3. Verify the tools are recognized

```bash
claude mcp list

# Or launch Claude Code and use
/mcp
```

If `aivisspeech` is displayed, the setup was successful.

> 💡 Tip: Claude Code doesn't auto-execute commands for safety. If you forget to start the server, the tools won't appear. During development, keep the above `npx` command running in a terminal, or use process managers like `pm2` or `systemd --user` for persistent operation.

### Using Claude Desktop

For manual configuration with Claude Desktop, you can simply add the following configuration:

> Using npx ensures you always get the latest version automatically. No manual updates needed.

```json
{
  "mcpServers": {
    "aivisspeech": {
      "command": "npx",
      "args": ["@shinshin86/mcp-simple-aivisspeech@latest"],
      "env": {
        "AIVISSPEECH_URL": "http://127.0.0.1:10101"
      }
    }
  }
}
```

## ⚙️ AivisSpeech Engine Setup

Before using this MCP server, complete these setup steps to ensure AivisSpeech is running locally.

1. Download AivisSpeech from [https://aivis-project.com/](https://aivis-project.com/)
2. Launch AivisSpeech on your local machine
3. The engine will start on the default port 10101
4. Verify the engine is running by visiting `http://127.0.0.1:10101/docs`

## 📖 Other Usage Methods

### For Local Development

```bash
# Run the MCP server
npm start

# For development with hot reload
npm run dev

# Check if everything is working
npm test
```

For cloning the repository, installing dependencies, and building:

```bash
# Clone repository
git clone https://github.com/shinshin86/mcp-simple-aivisspeech.git
cd mcp-simple-aivisspeech

# Install dependencies
npm install

# Build the project
npm run build
```

## 🛠️ Available Tools

### 🎤 `speak`
Convert text to speech and play audio with customizable voice parameters.

This tool accepts several configuration parameters, including the following options:
- `text` *(required)*: Text to convert to speech
- `speaker` *(optional)*: Speaker/voice ID (default: `888753760` - Anneli ノーマル)
- `speedScale` *(optional)*: Speech speed multiplier (`0.5`-`2.0`, default: `1.0`)
- `pitchScale` *(optional)*: Pitch adjustment (`-0.15`-`0.15`, default: `0.0`)
- `volumeScale` *(optional)*: Volume level (`0.0`-`2.0`, default: `1.0`)
- `playAudio` *(optional)*: Whether to play the generated audio (default: `true`)

Example usage:
```json
{
  "text": "こんにちは、世界！",
  "speaker": 888753760,
  "speedScale": 1.2,
  "pitchScale": 0.05,
  "volumeScale": 1.5
}
```

### 👥 `get_speakers`
Retrieve a list of all available voice characters and their styles.

This function returns: List of speakers with their IDs, names, and available voice styles.

### 🔔 `notify_completion`
Play a voice notification when tasks are completed.

This tool accepts several configuration parameters, including the following options:
- `message` *(optional)*: Completion message to announce (default: `"処理が完了しました"`)
- `speaker` *(optional)*: Speaker ID for the notification voice (default: `888753760` - Anneli ノーマル)

Example usage:
```json
{
  "message": "データ処理が完了しました",
  "speaker": 888753760
}
```

### 📊 `check_engine_status`
Check the current status and version of the AivisSpeech engine.

This function returns: Engine status, version information, and connectivity details.

## 🖥️ Platform Support

### Audio Playback Systems

| Platform | Audio Command | Requirements |
|----------|---------------|--------------|
| **macOS** | `afplay` | Built-in (no additional setup) |
| **Windows** | PowerShell Media.SoundPlayer | Windows PowerShell |
| **Linux** | `aplay` | ALSA utils (`sudo apt install alsa-utils`) |

### Tested Environments

- macOS 12+ (Intel & Apple Silicon)
- Windows 10/11
- Ubuntu 20.04+
- Node.js 18.x, 20.x, 21.x

## 🧪 Development

### Available Scripts

```bash
# Development & Building
npm run dev          # Run with hot reload (tsx)
npm run build        # Compile TypeScript to dist/
npm start           # Run compiled server

# Code Quality
npm run lint        # Run ESLint
npm run test        # Run Vitest tests (single run)
npm run test:watch  # Run tests in watch mode
npm run test:ui     # Run tests with UI
npm run test:coverage # Run tests with coverage

# Utilities
npm run clean       # Clean dist/ directory
```

### Local vs NPX Usage

When using MCP clients in production, use `npx @shinshin86/mcp-simple-aivisspeech@latest` in your MCP configuration. No local setup is required, and you always get the latest version.

For development, clone the repository and use `npm run dev` for hot reload, or `npm run build && npm start` for testing production builds.

### Project Architecture

```
mcp-simple-aivisspeech/
├── src/
│   ├── index.ts                  # MCP server & tool handlers
│   └── aivisspeech-client.ts     # AivisSpeech API client
├── tests/
│   └── aivisspeech-client.test.ts # Unit tests
├── dist/                         # Compiled output
├── docs/                         # Documentation
└── config files                  # TS, ESLint, Vitest configs
```

### API Client Architecture

The `AivisSpeechClient` class offers comprehensive functionality, providing several key capabilities:
- HTTP Client - Axios-based API communication
- Error Handling - Comprehensive error catching and reporting
- Type Safety - Full TypeScript interfaces for all API responses
- Connection Management - Health checks and status monitoring

### Adding New Features

1. **New Tool**: Add handler in `src/index.ts` `CallToolRequestSchema`
2. **API Methods**: Extend `AivisSpeechClient` class
3. **Types**: Update interfaces in `aivisspeech-client.ts`
4. **Tests**: Add corresponding test cases

## 🔧 Troubleshooting

### Common Issues

#### AivisSpeech Engine Not Found
```
Error: Failed to get version: connect ECONNREFUSED 127.0.0.1:10101
```
Consider these troubleshooting approaches to resolve this issue: Ensure AivisSpeech Engine is running on the correct port.

#### Audio Playback Fails
```
Error: Audio player exited with code 1
```
Consider these troubleshooting approaches to resolve this issue:
- macOS - Check if `afplay` is available
- Linux - Install ALSA utils (`sudo apt install alsa-utils`)
- Windows - Ensure PowerShell execution policy allows scripts

#### Permission Denied
```
Error: spawn afplay EACCES
```
Consider these troubleshooting approaches to resolve this issue: Check file permissions and system audio settings.

### Debug Mode

To enable verbose logging, run the following command:
```bash
DEBUG=mcp-aivisspeech npm run dev
```

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions from the community. Contributors can get started by completing these essential steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing TypeScript/ESLint configurations
- Add tests for new functionality
- Update documentation for API changes
- Ensure cross-platform compatibility

## 🙏 Acknowledgments

- [AivisSpeech Project](https://aivis-project.github.io/AivisSpeech-Engine/) for the excellent TTS engine
- [Model Context Protocol](https://github.com/anthropics/mcp) for the integration framework
- [VOICEVOX MCP](https://github.com/t09tanaka/mcp-simple-voicevox) for inspiration and reference

## 📞 Support

- Issues - [GitHub Issues](https://github.com/shinshin86/mcp-simple-aivisspeech/issues)
- Discussions - [GitHub Discussions](https://github.com/shinshin86/mcp-simple-aivisspeech/discussions)
- Documentation - [AivisSpeech API Docs](https://aivis-project.github.io/AivisSpeech-Engine/api/)

---

Made with ❤️ for the Japanese TTS community