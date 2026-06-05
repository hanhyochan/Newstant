export function createMockId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createTimestamp() {
  return new Date().toISOString();
}
