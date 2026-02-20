import axios from 'axios';
import { getConfig } from './config.js';

function getBaseURL() {
  return getConfig('baseUrl') || 'https://archive.org/services';
}

async function request(endpoint, params = {}) {
  const baseURL = getBaseURL();
  try {
    const response = await axios.get(`${baseURL}${endpoint}`, { params });
    return response.data;
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(`API Error: ${error.response.data.error}`);
    }
    throw new Error(`Request failed: ${error.message}`);
  }
}

// ============================================================
// Search Operations
// ============================================================

/**
 * Search Internet Archive with relevance ranking
 */
export async function searchOrganic(query, options = {}) {
  const params = {
    q: query,
    ...options
  };
  return await request('/search/v1/organic', params);
}

/**
 * Search with cursor-based pagination for large result sets
 */
export async function searchScrape(query, options = {}) {
  const params = {
    q: query,
    ...options
  };
  return await request('/search/v1/scrape', params);
}

/**
 * Get available metadata fields
 */
export async function getFields() {
  return await request('/search/v1/fields');
}

/**
 * Get total count for a query
 */
export async function getCount(query) {
  const params = {
    q: query,
    total_only: true
  };
  return await request('/search/v1/scrape', params);
}
