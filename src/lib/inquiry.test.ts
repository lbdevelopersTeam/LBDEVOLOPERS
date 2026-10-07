import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError, fetchJson } from './content';
import { inquiryEmailUrl, inquiryError, sendInquiry } from './inquiry';

vi.mock('./content', async () => {
  const actual = await vi.importActual<typeof import('./content')>('./content');
  return { ...actual, fetchJson: vi.fn() };
});

const input = { name: ' Test Person ', email: ' test@example.test ', subject: ' Project inquiry ', message: ' A valid project brief. ', website: '' };

describe('inquiry interface', () => {
  beforeEach(() => { vi.mocked(fetchJson).mockReset(); });
  it('sends the documented contract, trims visible fields, and validates acknowledgement', async () => {
    vi.mocked(fetchJson).mockResolvedValue({ id: 'message-id', received: true });
    await expect(sendInquiry(input, new AbortController().signal)).resolves.toEqual({ id: 'message-id', received: true });
    const [url, options] = vi.mocked(fetchJson).mock.calls[0];
    expect(url).toBe('/api/v2/messages');
    expect(options?.method).toBe('POST');
    expect(JSON.parse(options!.body as string)).toEqual({ name: 'Test Person', email: 'test@example.test', subject: 'Project inquiry', message: 'A valid project brief.', website: '' });
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });
  it('does not report success for a malformed acknowledgement', async () => {
    vi.mocked(fetchJson).mockResolvedValue({ id: 'message-id' });
    await expect(sendInquiry(input, new AbortController().signal)).rejects.toThrow('Invalid message acknowledgement');
  });
  it('does not retry a failed POST', async () => {
    vi.mocked(fetchJson).mockRejectedValue(new Error('Network failure'));
    await expect(sendInquiry(input, new AbortController().signal)).rejects.toThrow('Network failure');
    expect(fetchJson).toHaveBeenCalledTimes(1);
  });
  it('provides safe validation, rate-limit, and uncertain-delivery messages', () => {
    expect(inquiryError(new ApiRequestError(422, 'VALIDATION_ERROR', 'internal'))).toContain('check your name');
    expect(inquiryError(new ApiRequestError(429, 'RATE_LIMIT', 'internal'))).toContain('wait a few minutes');
    expect(inquiryError(new Error('secret'))).toContain('could not confirm delivery');
    expect(inquiryError(new Error('secret'))).not.toContain('secret');
  });
  it('encodes an email draft without treating it as submitted', () => {
    const url = inquiryEmailUrl('team@example.test', { ...input, subject: 'Research & design', message: 'Line one\nLine two' });
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('subject')).toBe('Research & design');
    expect(params.get('body')).toContain('Line one\nLine two');
    expect(params.get('body')).toContain('Reply to: test@example.test');
  });
});
