import { describe, expect, it } from 'vitest';
import { documentLinkTag } from '../../scripts/prerender-events.js';

const DOCS = {
  '3moylnprf642x': 'at://did:plc:alerts/site.standard.document/3moylnprf642x',
};

describe('standard.site document link tag', () => {
  it('emits the document tag on the canonical page when a record exists', () => {
    const tag = documentLinkTag('3moylnprf642x', 'canonical', DOCS);
    expect(tag).toContain('rel="site.standard.document"');
    expect(tag).toContain('href="at://did:plc:alerts/site.standard.document/3moylnprf642x"');
  });

  it('omits the document tag on the /resolved variant (path would not match)', () => {
    expect(documentLinkTag('3moylnprf642x', 'resolved', DOCS)).toBe('');
  });

  it('omits the document tag when no record exists for the id', () => {
    expect(documentLinkTag('unknownid', 'canonical', DOCS)).toBe('');
  });
});
