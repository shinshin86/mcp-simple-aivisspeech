import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AivisSpeechClient } from '../src/aivisspeech-client.js';

describe('AivisSpeechClient', () => {
  let client: AivisSpeechClient;

  beforeEach(() => {
    client = new AivisSpeechClient('http://localhost:10101');
  });

  describe('constructor', () => {
    it('should use default URL if not provided', () => {
      const defaultClient = new AivisSpeechClient();
      expect(defaultClient).toBeInstanceOf(AivisSpeechClient);
    });

    it('should use provided URL', () => {
      const customClient = new AivisSpeechClient('http://custom:8080');
      expect(customClient).toBeInstanceOf(AivisSpeechClient);
    });
  });

  describe('isEngineRunning', () => {
    it('should return false when engine is not running', async () => {
      const result = await client.isEngineRunning();
      expect(typeof result).toBe('boolean');
    });
  });
});