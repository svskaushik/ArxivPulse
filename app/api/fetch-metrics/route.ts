import { NextResponse } from 'next/server';
import axios from 'axios';

const SEMANTIC_SCHOLAR_API = 'https://api.semanticscholar.org/v1/paper/';
const ALTMETRIC_API = 'https://api.altmetric.com/v1/doi/';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const arxivId = searchParams.get('arxivId');
  const doi = searchParams.get('doi');

  if (!arxivId && !doi) {
    return NextResponse.json({ error: 'ArXiv ID or DOI is required' }, { status: 400 });
  }

  try {
    let citationCount = 0;
    let altmetric = 0;

    // Fetch citation count from Semantic Scholar
    if (arxivId) {
      const semanticScholarResponse = await axios.get(`${SEMANTIC_SCHOLAR_API}arXiv:${arxivId}`);
      citationCount = semanticScholarResponse.data.citationCount || 0;
    }

    // Fetch Altmetric score
    if (doi) {
      try {
        const altmetricResponse = await axios.get(`${ALTMETRIC_API}${doi}`);
        altmetric = altmetricResponse.data.score || 0;
      } catch (error) {
        console.error('Error fetching Altmetric score:', error);
        // Don't throw an error here, just log it and continue with altmetric as 0
      }
    }

    return NextResponse.json({ citationCount, altmetric });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Error fetching metrics' }, { status: 500 });
  }
}
