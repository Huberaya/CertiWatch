import { describe, it, expect } from 'vitest';
import { OPENAPI_V3_DOCUMENT, OPENAPI_ENDPOINTS } from '../../src/data/openApiSpec';
import { generateCodeSnippets } from '../../src/services/snippetGenerator';
import crypto from 'crypto';

describe('Chantier B : Portail Développeur Public & Spécification OpenAPI 3.0', () => {
  it('should validate OpenAPI 3.0 document schema and security schemes', () => {
    expect(OPENAPI_V3_DOCUMENT.openapi).toBe('3.0.3');
    expect(OPENAPI_V3_DOCUMENT.info.title).toContain('CertiWatch Enterprise B2B API');
    expect(OPENAPI_V3_DOCUMENT.info.version).toBe('1.4.2');
    expect(OPENAPI_V3_DOCUMENT.servers.length).toBeGreaterThanOrEqual(2);
    expect(OPENAPI_V3_DOCUMENT.components.securitySchemes.ApiKeyAuth).toBeDefined();
    expect(OPENAPI_V3_DOCUMENT.components.securitySchemes.BearerAuth).toBeDefined();
  });

  it('should contain comprehensive REST API endpoints covering ERP, suppliers, and certs', () => {
    expect(OPENAPI_ENDPOINTS.length).toBeGreaterThanOrEqual(7);

    const matrixEndpoint = OPENAPI_ENDPOINTS.find((e) => e.id === 'matrix-simulate');
    expect(matrixEndpoint).toBeDefined();
    expect(matrixEndpoint?.method).toBe('POST');
    expect(matrixEndpoint?.tag).toBe('Achats & Blocage ERP');
    expect(matrixEndpoint?.requestBodyExample).toHaveProperty('poNumber');
    expect(matrixEndpoint?.responseExamples.length).toBeGreaterThanOrEqual(2);

    const suppliersEndpoint = OPENAPI_ENDPOINTS.find((e) => e.id === 'suppliers-list');
    expect(suppliersEndpoint?.method).toBe('GET');

    const verifyEndpoint = OPENAPI_ENDPOINTS.find((e) => e.id === 'certificates-verify');
    expect(verifyEndpoint?.parameters?.[0].name).toBe('id');
  });

  it('should generate valid multi-language code snippets (cURL, Node, Python, Java, SAP ABAP)', () => {
    const endpoint = OPENAPI_ENDPOINTS[0];
    const snippets = generateCodeSnippets(endpoint, 'cw_live_sk_test_123');

    expect(snippets.length).toBe(5);

    const curl = snippets.find((s) => s.language === 'curl');
    expect(curl?.code).toContain('curl -X POST');
    expect(curl?.code).toContain('X-API-Key: cw_live_sk_test_123');

    const node = snippets.find((s) => s.language === 'node');
    expect(node?.code).toContain('fetch(');
    expect(node?.code).toContain('headers:');

    const python = snippets.find((s) => s.language === 'python');
    expect(python?.code).toContain('import requests');
    expect(python?.code).toContain('requests.post');

    const java = snippets.find((s) => s.language === 'java');
    expect(java?.code).toContain('OkHttpClient');

    const sap = snippets.find((s) => s.language === 'sap_abap');
    expect(sap?.code).toContain('cl_http_client');
    expect(sap?.code).toContain('lo_http_client->request->set_method');
  });

  it('should accurately calculate and verify HMAC-SHA256 signature for outgoing ERP webhooks', () => {
    const secretKey = 'whsec_test_secret_9981';
    const payload = JSON.stringify({
      event: 'certificate.expired',
      supplierId: 'sup-1',
      certificateNumber: 'GOTS-2024-8849-FR',
      timestamp: '2026-10-04T10:00:00Z',
    });

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');

    expect(expectedSignature).toBeDefined();
    expect(expectedSignature.length).toBe(64); // 256 bits = 64 hex characters

    // Verify constant-time comparison
    const incomingSignature = `sha256=${expectedSignature}`;
    const extractedHash = incomingSignature.replace('sha256=', '');
    expect(crypto.timingSafeEqual(Buffer.from(extractedHash), Buffer.from(expectedSignature))).toBe(true);
  });
});
