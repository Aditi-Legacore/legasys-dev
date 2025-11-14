import crypto from 'crypto';

export function hashReferenceId(referenceId: string): string {
  return crypto.createHash('sha256').update(referenceId).digest('hex');
}
