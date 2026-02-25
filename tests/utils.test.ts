import { describe, expect, it } from 'vitest';
import { isAgentRequest, AI_USER_AGENTS } from '../src/utils.js';

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request('https://example.com/', { headers });
}

describe('isAgentRequest', () => {
  describe('Accept header detection', () => {
    it('returns true for exact text/markdown', () => {
      expect(isAgentRequest(makeRequest({ accept: 'text/markdown' }))).toBe(true);
    });

    it('returns true for text/markdown among other types', () => {
      expect(isAgentRequest(makeRequest({ accept: 'text/html, text/markdown, */*' }))).toBe(true);
    });

    it('returns false for text/html only', () => {
      expect(isAgentRequest(makeRequest({ accept: 'text/html, */*' }))).toBe(false);
    });

    it('returns false when no Accept header is present', () => {
      expect(isAgentRequest(makeRequest())).toBe(false);
    });
  });

  describe('User-Agent detection', () => {
    it.each(AI_USER_AGENTS)('returns true for known agent: %s', (ua) => {
      expect(isAgentRequest(makeRequest({ 'user-agent': ua }))).toBe(true);
    });

    it('is case-insensitive for User-Agent matching', () => {
      expect(isAgentRequest(makeRequest({ 'user-agent': 'GPTBOT/1.0' }))).toBe(true);
    });

    it('returns true when User-Agent contains agent string with version', () => {
      expect(isAgentRequest(makeRequest({ 'user-agent': 'Mozilla/5.0 (compatible; GPTBot/1.1)' }))).toBe(true);
    });

    it('returns false for regular browser User-Agent', () => {
      expect(isAgentRequest(makeRequest({ 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }))).toBe(false);
    });

    it('returns false for curl without matching UA', () => {
      expect(isAgentRequest(makeRequest({ 'user-agent': 'curl/8.5.0' }))).toBe(false);
    });
  });

  describe('precedence', () => {
    it('returns true when both Accept and User-Agent match', () => {
      expect(
        isAgentRequest(makeRequest({ accept: 'text/markdown', 'user-agent': 'GPTBot/1.0' })),
      ).toBe(true);
    });

    it('Accept: text/markdown takes precedence over an unrecognised UA', () => {
      expect(
        isAgentRequest(makeRequest({ accept: 'text/markdown', 'user-agent': 'curl/8.5.0' })),
      ).toBe(true);
    });
  });

  describe('extraAgents', () => {
    it('returns true when UA matches an extra agent string', () => {
      expect(
        isAgentRequest(makeRequest({ 'user-agent': 'MyCustomBot/2.0' }), ['MyCustomBot']),
      ).toBe(true);
    });

    it('extra agents are case-insensitive', () => {
      expect(
        isAgentRequest(makeRequest({ 'user-agent': 'mycustombot/2.0' }), ['MyCustomBot']),
      ).toBe(true);
    });

    it('returns false when UA matches neither built-in nor extra agents', () => {
      expect(
        isAgentRequest(makeRequest({ 'user-agent': 'curl/8.5.0' }), ['MyCustomBot']),
      ).toBe(false);
    });

    it('still detects built-in agents when extraAgents is provided', () => {
      expect(
        isAgentRequest(makeRequest({ 'user-agent': 'GPTBot/1.0' }), ['MyCustomBot']),
      ).toBe(true);
    });

    it('works with an empty extraAgents array', () => {
      expect(
        isAgentRequest(makeRequest({ 'user-agent': 'GPTBot/1.0' }), []),
      ).toBe(true);
    });
  });
});
