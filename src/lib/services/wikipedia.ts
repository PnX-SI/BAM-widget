/**
 * Service Wikipedia - Récupère descriptions depuis Wikipedia API
 * Support multilingue avec fallback intelligent
 */

import { globalRequestQueue } from './requestQueue';
import ParameterStore from '../parameterStore';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_DESCRIPTION_CHARS = 500; // Limiter à 2-3 phrases

interface CacheEntry {
    description: string;
    timestamp: number;
}

interface WikipediaSummary {
    extract?: string;
    extract_html?: string;
}

class WikipediaService {
    private cache: Map<string, CacheEntry> = new Map();
    private readonly supportedLanguages = ['en', 'fr', 'es', 'cs', 'de', 'it'];

    /**
     * Récupère la description Wikipedia pour un article donné
     * @param title Titre de l'article Wikipedia
     * @param lang Code langue (fallback sur EN si non disponible)
     * @returns Description ou string vide si non trouvée
     */
    async getDescription(title: string, lang: string = 'en'): Promise<string> {
        // Normaliser la langue
        const normalizedLang = this.normalizeLanguage(lang);
        const cacheKey = `${normalizedLang}:${title}`;

        // Vérifier cache
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return cached.description;
        }

        try {
            // Essayer la langue demandée d'abord
            let description = await this.fetchWikipediaDescription(title, normalizedLang);

            // Si pas trouvé et pas EN, essayer EN
            if (!description && normalizedLang !== 'en') {
                description = await this.fetchWikipediaDescription(title, 'en');
            }

            // Mettre en cache
            this.cache.set(cacheKey, {
                description: description || '',
                timestamp: Date.now(),
            });

            return description;
        } catch (error) {
            console.warn(
                `[WikipediaService] Erreur récupération description pour "${title}" (${lang}):`,
                error
            );
            // Cache aussi les erreurs
            this.cache.set(cacheKey, {
                description: '',
                timestamp: Date.now(),
            });
            return '';
        }
    }

    /**
     * Fetch description depuis Wikipedia API REST
     */
    private async fetchWikipediaDescription(title: string, lang: string): Promise<string> {
        const encodedTitle = encodeURIComponent(title);
        const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;

        const response = await globalRequestQueue.add(() => fetch(url));

        if (!response.ok) {
            if (response.status === 404) {
                return ''; // Article not found
            }
            throw new Error(`Wikipedia API failed: ${response.status} ${response.statusText}`);
        }

        const data: WikipediaSummary = await response.json();

        if (!data.extract) {
            return '';
        }

        // Limiter la longueur et nettoyer
        return this.cleanAndLimitDescription(data.extract);
    }

    /**
     * Nettoie et limite la description
     */
    private cleanAndLimitDescription(text: string): string {
        // Supprimer balises HTML et caractères spéciaux
        let cleaned = text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();

        // Limiter à MAX_DESCRIPTION_CHARS
        if (cleaned.length > MAX_DESCRIPTION_CHARS) {
            // Trouver le dernier espace avant la limite pour couper proprement
            const truncated = cleaned.substring(0, MAX_DESCRIPTION_CHARS);
            const lastSpace = truncated.lastIndexOf(' ');
            cleaned = truncated.substring(0, lastSpace > 0 ? lastSpace : MAX_DESCRIPTION_CHARS) + '...';
        }

        return cleaned;
    }

    /**
     * Normalise le code langue (ex: en_US → en)
     */
    private normalizeLanguage(lang: string): string {
        const baseLang = lang.split('_')[0].toLowerCase();
        // Vérifier que la langue est supportée
        return this.supportedLanguages.includes(baseLang) ? baseLang : 'en';
    }

    /**
     * Récupère description pour plusieurs articles en parallèle
     * @param titles Array de titres Wikipedia
     * @param lang Code langue
     * @returns Map titre → description
     */
    async getMultipleDescriptions(
        titles: string[],
        lang: string = 'en'
    ): Promise<Map<string, string>> {
        const results = new Map<string, string>();

        // Créer promesses pour chaque titre
        const promises = titles.map((title) =>
            this.getDescription(title, lang).then((desc) => {
                results.set(title, desc);
            })
        );

        // Attendre toutes les promesses (avec error handling)
        await Promise.all(promises.map((p) => p.catch(() => {})));

        return results;
    }

    /**
     * Efface le cache (utile pour tests)
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Retourne la taille du cache
     */
    getCacheSize(): number {
        return this.cache.size;
    }
}

export const wikipediaService = new WikipediaService();
