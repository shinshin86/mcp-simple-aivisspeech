import axios, { AxiosResponse } from 'axios';

export interface SpeakerInfo {
  name: string;
  speaker_uuid: string;
  styles: Array<{
    id: number;
    name: string;
    type: string;
  }>;
  version: string;
  supported_features: {
    permitted_synthesis_morphing: string;
  };
}

export interface SynthesisOptions {
  text: string;
  speaker: number;
  speedScale?: number;
  pitchScale?: number;
  intonationScale?: number;
  volumeScale?: number;
  prePhonemeLength?: number;
  postPhonemeLength?: number;
  tempoDynamicsScale?: number;
}

export interface AudioQuery {
  accent_phrases: Array<{
    moras: Array<{
      text: string;
      consonant?: string;
      consonant_length?: number;
      vowel: string;
      vowel_length: number;
      pitch: number;
    }>;
    accent: number;
    pause_mora?: {
      text: string;
      vowel: string;
      vowel_length: number;
      pitch: number;
    };
  }>;
  speedScale: number;
  pitchScale: number;
  intonationScale: number;
  volumeScale: number;
  prePhonemeLength: number;
  postPhonemeLength: number;
  tempoDynamicsScale: number;
  outputSamplingRate: number;
  outputStereo: boolean;
  kana?: string;
}

export class AivisSpeechClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://127.0.0.1:10101') {
    this.baseUrl = baseUrl;
  }

  async getVersion(): Promise<string> {
    try {
      const response: AxiosResponse<string> = await axios.get(`${this.baseUrl}/version`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Failed to get version: HTTP ${error.response.status} - ${error.response.data}`);
      } else if (error.request) {
        throw new Error(`Failed to get version: No response from ${this.baseUrl} - ${error.message}`);
      } else {
        throw new Error(`Failed to get version: ${error.message}`);
      }
    }
  }

  async getSpeakers(): Promise<SpeakerInfo[]> {
    try {
      const response: AxiosResponse<SpeakerInfo[]> = await axios.get(`${this.baseUrl}/speakers`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get speakers: ${error.message}`);
      }
      throw new Error(`Failed to get speakers: ${error}`);
    }
  }

  async getSpeakerInfo(speakerId: number): Promise<SpeakerInfo> {
    try {
      const response: AxiosResponse<SpeakerInfo> = await axios.get(`${this.baseUrl}/speaker_info`, {
        params: { speaker: speakerId }
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get speaker info: ${error.message}`);
      }
      throw new Error(`Failed to get speaker info: ${error}`);
    }
  }

  async createAudioQuery(text: string, speaker: number): Promise<AudioQuery> {
    try {
      const response: AxiosResponse<AudioQuery> = await axios.post(
        `${this.baseUrl}/audio_query`,
        null,
        {
          params: { 
            text,
            speaker 
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const detail = error.response.data?.detail || error.response.data || 'Unknown validation error';
        throw new Error(`Failed to create audio query: Invalid request - ${JSON.stringify(detail)}`);
      } else if (error.response) {
        throw new Error(`Failed to create audio query: HTTP ${error.response.status} - ${error.response.data}`);
      } else if (error.request) {
        throw new Error(`Failed to create audio query: No response from ${this.baseUrl}`);
      } else {
        throw new Error(`Failed to create audio query: ${error.message}`);
      }
    }
  }

  async synthesis(audioQuery: AudioQuery, speaker: number): Promise<Buffer> {
    try {
      const response: AxiosResponse<ArrayBuffer> = await axios.post(
        `${this.baseUrl}/synthesis`,
        audioQuery,
        {
          params: { speaker },
          headers: {
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );
      return Buffer.from(response.data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to synthesize audio: ${error.message}`);
      }
      throw new Error(`Failed to synthesize audio: ${error}`);
    }
  }

  async textToSpeech(options: SynthesisOptions): Promise<Buffer> {
    const {
      text,
      speaker,
      speedScale = 1.0,
      pitchScale = 0.0,
      intonationScale = 1.0,
      volumeScale = 1.0,
      prePhonemeLength = 0.1,
      postPhonemeLength = 0.1,
      tempoDynamicsScale = 1.0
    } = options;

    try {
      const audioQuery = await this.createAudioQuery(text, speaker);
      
      audioQuery.speedScale = speedScale;
      audioQuery.pitchScale = pitchScale;
      audioQuery.intonationScale = intonationScale;
      audioQuery.volumeScale = volumeScale;
      audioQuery.prePhonemeLength = prePhonemeLength;
      audioQuery.postPhonemeLength = postPhonemeLength;
      audioQuery.tempoDynamicsScale = tempoDynamicsScale;

      const audioBuffer = await this.synthesis(audioQuery, speaker);
      return audioBuffer;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to convert text to speech: ${error}`);
    }
  }

  async isEngineRunning(): Promise<boolean> {
    try {
      await this.getVersion();
      return true;
    } catch {
      return false;
    }
  }
}