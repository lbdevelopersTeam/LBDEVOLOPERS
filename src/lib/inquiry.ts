import { ApiRequestError, fetchJson } from './content';

export interface Inquiry {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
  memberId?: string;
}

// POSTs are deliberately not retried: a timeout can happen after acceptance.
export async function sendInquiry(input: Inquiry, signal: AbortSignal) {
  const response = await fetchJson<{ id: string; received: boolean }>('/api/v2/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]),
    body: JSON.stringify({ ...input, name: input.name.trim(), email: input.email.trim(), subject: input.subject.trim(), message: input.message.trim() }),
  });
  if (!response || typeof response.id !== 'string' || response.received !== true) {
    throw new Error('Invalid message acknowledgement');
  }
  return response;
}

export function inquiryError(error: unknown) {
  if (error instanceof ApiRequestError && error.status === 422) {
    return 'Please check your name, email and message, then try again.';
  }
  if (error instanceof ApiRequestError && error.status === 429) {
    return 'Too many requests. Please wait a few minutes before trying again.';
  }
  return 'We could not confirm delivery. Your text is still here. Please check your email before retrying, or contact us directly.';
}

export function inquiryEmailUrl(recipient: string, input: Inquiry) {
  const body = [input.message.trim(), '', `From: ${input.name.trim()}`, `Reply to: ${input.email.trim()}`].join('\n');
  return `mailto:${recipient}?subject=${encodeURIComponent(input.subject.trim())}&body=${encodeURIComponent(body)}`;
}
