// DOI verification using CrossRef API

export interface DOIVerificationResult {
    doi: string;
    valid: boolean;
    title?: string;
    authors?: string[];
    year?: number;
    journal?: string;
    url?: string;
    error?: string;
}

/**
 * Verify a single DOI using CrossRef API
 */
export async function verifyDOI(doi: string): Promise<DOIVerificationResult> {
    try {
        // Clean DOI (remove any trailing punctuation)
        const cleanDOI = doi.replace(/[.,;:)\]]+$/, '');

        const response = await fetch(`https://api.crossref.org/works/${cleanDOI}`, {
            headers: {
                'User-Agent': 'HaiDebate/1.0 (mailto:support@haidebate.com)'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return {
                    doi: cleanDOI,
                    valid: false,
                    error: 'DOI không tồn tại trong CrossRef database'
                };
            }
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const work = data.message;

        // Extract authors
        const authors = work.author?.map((a: any) => {
            const given = a.given || '';
            const family = a.family || '';
            return `${given} ${family}`.trim();
        }).filter(Boolean) || [];

        // Extract year
        const year = work.published?.['date-parts']?.[0]?.[0] ||
            work.created?.['date-parts']?.[0]?.[0];

        return {
            doi: cleanDOI,
            valid: true,
            title: work.title?.[0] || 'No title',
            authors,
            year,
            journal: work['container-title']?.[0] || 'Unknown journal',
            url: work.URL || `https://doi.org/${cleanDOI}`
        };
    } catch (error) {
        return {
            doi,
            valid: false,
            error: error instanceof Error ? error.message : 'Lỗi kết nối CrossRef API'
        };
    }
}

/**
 * Search and verify by query string (title, authors, etc.)
 */
export async function verifyByQuery(query: string): Promise<DOIVerificationResult> {
    try {
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(`https://api.crossref.org/works?query=${encodedQuery}&rows=1`, {
            headers: {
                'User-Agent': 'HaiDebate/1.0 (mailto:support@haidebate.com)'
            }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const items = data.message.items;

        if (!items || items.length === 0) {
            return {
                doi: 'N/A',
                valid: false,
                error: 'Không tìm thấy kết quả phù hợp'
            };
        }

        const work = items[0];
        const authors = work.author?.map((a: any) => {
            const given = a.given || '';
            const family = a.family || '';
            return `${given} ${family}`.trim();
        }).filter(Boolean) || [];

        const year = work.published?.['date-parts']?.[0]?.[0] ||
            work.created?.['date-parts']?.[0]?.[0];

        return {
            doi: work.DOI || 'N/A',
            valid: true,
            title: work.title?.[0] || 'No title',
            authors,
            year,
            journal: work['container-title']?.[0] || 'Unknown journal',
            url: work.URL || (work.DOI ? `https://doi.org/${work.DOI}` : undefined)
        };
    } catch (error) {
        return {
            doi: 'N/A',
            valid: false,
            error: error instanceof Error ? error.message : 'Lỗi kết nối CrossRef search'
        };
    }
}

/**
 * Verify multiple DOIs with rate limiting
 */
export async function verifyAllDOIs(
    dois: string[],
    onProgress?: (current: number, total: number) => void
): Promise<DOIVerificationResult[]> {
    const results: DOIVerificationResult[] = [];

    for (let i = 0; i < dois.length; i++) {
        const result = await verifyDOI(dois[i]);
        results.push(result);

        // Report progress
        onProgress?.(i + 1, dois.length);

        // Rate limiting: 100ms between requests (10 req/sec, well below 50 req/sec limit)
        if (i < dois.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
}

/**
 * Get verification summary
 */
export function getVerificationSummary(results: DOIVerificationResult[]): {
    total: number;
    valid: number;
    invalid: number;
    errorRate: number;
} {
    const total = results.length;
    const valid = results.filter(r => r.valid).length;
    const invalid = total - valid;
    const errorRate = total > 0 ? (invalid / total) * 100 : 0;

    return { total, valid, invalid, errorRate };
}
