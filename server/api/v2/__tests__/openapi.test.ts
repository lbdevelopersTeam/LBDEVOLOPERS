import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';

describe('OpenAPI v2 contract', () => {
  it('is valid YAML with stable operation IDs and declared security schemes', async () => {
    const source = await fs.readFile(path.resolve(process.cwd(), 'docs/openapi-v2.yaml'), 'utf8');
    const document = parse(source) as { openapi: string; paths: Record<string, Record<string, { operationId?: string }>>; components: { securitySchemes: Record<string, unknown> } };
    expect(document.openapi).toBe('3.1.0');
    expect(Object.keys(document.paths).length).toBeGreaterThan(10);
    const operationIds = Object.values(document.paths).flatMap((pathItem) => Object.values(pathItem).map((operation) => operation.operationId).filter(Boolean));
    expect(new Set(operationIds).size).toBe(operationIds.length);
    expect(document.components.securitySchemes).toHaveProperty('sessionCookie');
    expect(document.components.securitySchemes).toHaveProperty('csrfToken');
  });
});
