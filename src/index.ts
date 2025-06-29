#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { AivisSpeechClient, SynthesisOptions } from './aivisspeech-client.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';

const server = new Server(
  {
    name: '@shinshin86/mcp-simple-aivisspeech',
    version: '0.1.0',
  }
);

const engineUrl = process.env.AIVISSPEECH_URL || 'http://127.0.0.1:10101';
const client = new AivisSpeechClient(engineUrl);

// Default speaker: Anneli (ノーマル)
const DEFAULT_SPEAKER_ID = 888753760;

async function playAudio(audioBuffer: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const tempFile = join(tmpdir(), `aivisspeech_${Date.now()}.wav`);
    
    fs.writeFile(tempFile, audioBuffer)
      .then(() => {
        let command: string;
        let args: string[];

        if (process.platform === 'darwin') {
          command = 'afplay';
          args = [tempFile];
        } else if (process.platform === 'win32') {
          command = 'powershell';
          args = ['-c', `(New-Object Media.SoundPlayer '${tempFile}').PlaySync()`];
        } else {
          command = 'aplay';
          args = [tempFile];
        }

        const player = spawn(command, args);
        
        player.on('close', (code) => {
          fs.unlink(tempFile).catch(() => {});
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Audio player exited with code ${code}`));
          }
        });

        player.on('error', (error) => {
          fs.unlink(tempFile).catch(() => {});
          reject(error);
        });
      })
      .catch(reject);
  });
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const isEngineRunning = await client.isEngineRunning();
  
  if (!isEngineRunning) {
    return {
      tools: [
        {
          name: 'check_engine_status',
          description: 'Check if AivisSpeech engine is running',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ] as Tool[],
    };
  }

  return {
    tools: [
      {
        name: 'speak',
        description: 'Convert text to speech using AivisSpeech and play it',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to convert to speech',
            },
            speaker: {
              type: 'number',
              description: 'Speaker ID (voice character) - default: Anneli (ノーマル)',
              default: DEFAULT_SPEAKER_ID,
            },
            speedScale: {
              type: 'number',
              description: 'Speech speed scale (0.5-2.0)',
              default: 1.0,
              minimum: 0.5,
              maximum: 2.0,
            },
            pitchScale: {
              type: 'number',
              description: 'Pitch scale (-0.15-0.15)',
              default: 0.0,
              minimum: -0.15,
              maximum: 0.15,
            },
            volumeScale: {
              type: 'number',
              description: 'Volume scale (0.0-2.0)',
              default: 1.0,
              minimum: 0.0,
              maximum: 2.0,
            },
            playAudio: {
              type: 'boolean',
              description: 'Whether to play the generated audio',
              default: true,
            },
          },
          required: ['text'],
        },
      },
      {
        name: 'get_speakers',
        description: 'Get list of available speakers (voice characters)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'notify_completion',
        description: 'Play a notification sound when a task is completed',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Completion message to announce',
              default: '処理が完了しました',
            },
            speaker: {
              type: 'number',
              description: 'Speaker ID for the notification voice - default: Anneli (ノーマル)',
              default: DEFAULT_SPEAKER_ID,
            },
          },
        },
      },
      {
        name: 'check_engine_status',
        description: 'Check if AivisSpeech engine is running',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ] as Tool[],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'speak': {
      const { text, speaker = DEFAULT_SPEAKER_ID, speedScale = 1.0, pitchScale = 0.0, volumeScale = 1.0, playAudio: shouldPlayAudio = true } = args as {
        text: string;
        speaker?: number;
        speedScale?: number;
        pitchScale?: number;
        volumeScale?: number;
        playAudio?: boolean;
      };

      try {
        const options: SynthesisOptions = {
          text,
          speaker,
          speedScale,
          pitchScale,
          volumeScale,
        };

        const audioBuffer = await client.textToSpeech(options);

        if (shouldPlayAudio) {
          await playAudio(audioBuffer);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Successfully converted "${text}" to speech using speaker ${speaker}${shouldPlayAudio ? ' and played it' : ''}`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // If it's a speaker-related error, provide helpful suggestions
        if (errorMessage.includes('speaker') || errorMessage.includes('Speaker')) {
          try {
            const speakers = await client.getSpeakers();
            const speakerList = speakers.slice(0, 5).map(s => 
              `${s.styles[0]?.id || 'N/A'}: ${s.name}${s.styles.length > 0 ? ` (${s.styles[0].name})` : ''}`
            ).join('\n');
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Error: ${errorMessage}\n\nAvailable speakers (showing first 5):\n${speakerList}\n\nDefault: ${DEFAULT_SPEAKER_ID} (Anneli ノーマル)\nUse "get_speakers" tool to see all available speakers.`,
                },
              ],
              isError: true,
            };
          } catch {
            // Fallback if we can't get speakers
            return {
              content: [
                {
                  type: 'text',
                  text: `Error: ${errorMessage}\n\nTry using the default speaker (${DEFAULT_SPEAKER_ID}: Anneli ノーマル) or use "get_speakers" tool to see available speakers.`,
                },
              ],
              isError: true,
            };
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }

    case 'get_speakers': {
      try {
        const speakers = await client.getSpeakers();
        const speakerList = speakers.map(speaker => 
          `Speaker: ${speaker.name}${speaker.styles.length > 0 ? 
            ` (Styles: ${speaker.styles.map(style => `${style.id}: ${style.name}`).join(', ')})` : ''}`
        ).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Available speakers:\n${speakerList}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting speakers: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }

    case 'notify_completion': {
      const { message = '処理が完了しました', speaker = DEFAULT_SPEAKER_ID } = args as {
        message?: string;
        speaker?: number;
      };

      try {
        const audioBuffer = await client.textToSpeech({
          text: message,
          speaker,
          speedScale: 1.0,
          volumeScale: 1.2,
        });

        await playAudio(audioBuffer);

        return {
          content: [
            {
              type: 'text',
              text: `Completion notification played: "${message}"`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error playing notification: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }

    case 'check_engine_status': {
      try {
        const isRunning = await client.isEngineRunning();
        const version = isRunning ? await client.getVersion() : null;

        return {
          content: [
            {
              type: 'text',
              text: isRunning 
                ? `AivisSpeech engine is running (version: ${version})`
                : 'AivisSpeech engine is not running. Please start the engine at http://127.0.0.1:10101',
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error checking engine status: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }

    default:
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AivisSpeech MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});