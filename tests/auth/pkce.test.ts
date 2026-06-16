import { describe, it, expect } from 'vitest';
import { generateCodeVerifier, generateCodeChallenge, buildAuthorizationUrl } from '../../src/auth/pkce.js';

describe('PKCE', () => {
  it('generateCodeVerifier produces a non-empty string', () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toBeTruthy();
    expect(verifier.length).toBeGreaterThan(40);
  });

  it('generates unique verifiers', () => {
    const v1 = generateCodeVerifier();
    const v2 = generateCodeVerifier();
    expect(v1).not.toBe(v2);
  });

  it('generateCodeChallenge produces base64url output', () => {
    const challenge = generateCodeChallenge('test-verifier');
    expect(challenge).toBeTruthy();
    // Base64url should not contain + or /
    expect(challenge).not.toContain('+');
    expect(challenge).not.toContain('/');
  });

  it('buildAuthorizationUrl constructs a valid URL', () => {
    const url = buildAuthorizationUrl(
      'https://auth.example.com/authorize',
      'client-123',
      'http://localhost:8080/callback',
      'challenge-abc',
      'state-xyz',
      'openid profile',
    );

    expect(url).toContain('auth.example.com/authorize');
    expect(url).toContain('response_type=code');
    expect(url).toContain('client_id=client-123');
    expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fcallback');
    expect(url).toContain('code_challenge=challenge-abc');
    expect(url).toContain('code_challenge_method=S256');
    expect(url).toContain('state=state-xyz');
    expect(url).toContain('scope=openid+profile');
  });

  it('buildAuthorizationUrl omits scope when not provided', () => {
    const url = buildAuthorizationUrl(
      'https://auth.example.com/authorize',
      'client-123',
      'http://localhost:8080/callback',
      'challenge-abc',
      'state-xyz',
    );

    expect(url).not.toContain('scope=');
  });
});
