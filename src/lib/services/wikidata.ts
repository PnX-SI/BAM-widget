/**
 * Service Wikidata - Récupère Wikidata ID à partir d'un GBIF ID
 * Utilise SPARQL pour récupérer lien Wikipedia multilingue
 */

import { globalRequestQueue } from './requestQueue';

const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
    wikidataId: string | null;
    timestamp: number;
}

interface WikidataQueryResult {
    taxon?: { value: string };
    wikidataId?: { value: string };
}

class WikidataService {
    private cache: Map<string, CacheEntry> = new Map();

    /**
     * Récupère le Wikidata ID pour un GBIF ID donné
     * @param gbifId ID GBIF du taxon
     * @returns Wikidata ID ou null si non trouvé
     */
    async getWikidataIdByGbifId(gbifId: string): Promise<string | null> {
        // Vérifier cache
        const cached = this.cache.get(gbifId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return cached.wikidataId;
        }

        try {
            const result = await globalRequestQueue.add(() =>
                this.queryWikidata(gbifId)
            );

            // Mettre en cache (même si null)
            this.cache.set(gbifId, {
                wikidataId: result,
                timestamp: Date.now(),
            });

            return result;
        } catch (error) {
            console.warn(
                `[WikidataService] Erreur récupération Wikidata ID pour GBIF ${gbifId}:`,
                error
            );
            // Cache aussi les erreurs pour éviter requêtes répétées
            this.cache.set(gbifId, {
                wikidataId: null,
                timestamp: Date.now(),
            });
            return null;
        }
    }

    /**
     * Query SPARQL pour trouver Wikidata ID par GBIF ID
     */
    private async queryWikidata(gbifId: string): Promise<string | null> {
        const sparql = `
            SELECT ?taxon WHERE {
                ?taxon wdt:P846 "${gbifId}" .
            }
            LIMIT 1
        `;

        const response = await fetch(WIKIDATA_SPARQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/sparql-results+json',
            },
            body: new URLSearchParams({ query: sparql }),
        });

        if (!response.ok) {
            throw new Error(
                `Wikidata SPARQL failed: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        if (!data.results?.bindings || data.results.bindings.length === 0) {
            return null;
        }

        // Extract Wikidata ID from URI (e.g., "http://www.wikidata.org/entity/Q1234" -> "Q1234")
        const taxonUri = data.results.bindings[0].taxon.value;
        const wikidataId = taxonUri.split('/').pop();

        return wikidataId || null;
    }

    /**
     * Récupère les liens Wikipedia pour un Wikidata ID dans plusieurs langues
     * @param wikidataId Wikidata ID
     * @returns Object avec clés langue (en, fr, es, etc.) et URLs Wikipedia
     */
    async getWikipediaLinksForWikidata(wikidataId: string): Promise<Record<string, string>> {
        try {
            const response = await globalRequestQueue.add(() =>
                fetch(`https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`)
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch Wikidata entity: ${response.status}`);
            }

            const data = await response.json();
            const entity = data.entities[wikidataId];

            if (!entity?.sitelinks) {
                return {};
            }

            const wikipediaLinks: Record<string, string> = {};

            // Extraire les liens Wikipedia pour chaque langue
            Object.entries(entity.sitelinks).forEach(([key, value]: [string, any]) => {
                if (key.endsWith('wiki')) {
                    const lang = key.replace('wiki', '');
                    wikipediaLinks[lang] = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
                        value.title
                    )}`;
                }
            });

            return wikipediaLinks;
        } catch (error) {
            console.warn(
                `[WikidataService] Erreur récupération Wikipedia links pour Wikidata ${wikidataId}:`,
                error
            );
            return {};
        }
    }

    /**
     * Efface le cache (utile pour tests)
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Retourne la taille du cache (utile pour monitoring)
     */
    getCacheSize(): number {
        return this.cache.size;
    }
}

export const wikidataService = new WikidataService();
