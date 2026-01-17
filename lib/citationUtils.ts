// Citation extraction and parsing utilities

export interface Citation {
    type: 'doi' | 'author-year';
    raw: string;
    doi?: string;
    author?: string;
    year?: number;
    position: { start: number; end: number };
}

/**
 * Extract all citations from content
 */
export function extractCitations(content: string): Citation[] {
    const citations: Citation[] = [];

    // Extract DOIs (format: 10.xxxx/xxxxx)
    const doiRegex = /10\.\d{4,9}\/[^\s\]]+/g;
    let match;

    while ((match = doiRegex.exec(content)) !== null) {
        citations.push({
            type: 'doi',
            raw: match[0],
            doi: match[0],
            position: { start: match.index, end: match.index + match[0].length }
        });
    }

    // Extract (Author, Year) patterns
    // Matches: (Davis, 1989), (Nguyen et al., 2023), etc.
    const authorYearRegex = /\(([A-Z][a-z]+(?:\s+et\s+al\.)?),?\s+(\d{4})\)/g;

    while ((match = authorYearRegex.exec(content)) !== null) {
        citations.push({
            type: 'author-year',
            raw: match[0],
            author: match[1],
            year: parseInt(match[2]),
            position: { start: match.index, end: match.index + match[0].length }
        });
    }

    return citations;
}

/**
 * Extract only DOIs from content
 */
export function extractDOIs(content: string): string[] {
    const citations = extractCitations(content);
    return citations
        .filter(c => c.type === 'doi' && c.doi)
        .map(c => c.doi!);
}

/**
 * Count citations by type
 */
export function countCitations(content: string): { doi: number; authorYear: number; total: number } {
    const citations = extractCitations(content);
    const doi = citations.filter(c => c.type === 'doi').length;
    const authorYear = citations.filter(c => c.type === 'author-year').length;

    return { doi, authorYear, total: citations.length };
}
