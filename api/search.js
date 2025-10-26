// Fonction de recherche catégorisée Vercel.
// Elle accepte les paramètres 'query' (le terme de recherche) et 'type' (Anime, Game, Movie).

const axios = require('axios');
const ANILIST_API_URL = 'https://graphql.anilist.co';

// Requête GraphQL pour rechercher des animes
const ANILIST_SEARCH_QUERY = `
  query SearchAnime($search: String) {
    Page(page: 1, perPage: 25) {
      media(search: $search, type: ANIME) {
        id
        title { romaji english }
        description(asHtml: false)
        coverImage { extraLarge }
        averageScore
        episodes
        genres
        siteUrl
      }
    }
  }
`;

// Fonction principale pour la requête Vercel
module.exports = async (request, response) => {
    // Configuration de CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(204).send('');
    }

    // Extraction des paramètres 'query' et 'type'
    const { query } = require('url').parse(request.url, true);
    const searchTerm = query.query;
    const contentType = query.type; // Ex: 'anime', 'game', 'movie'

    if (!searchTerm || !contentType) {
        return response.status(400).json({
            status: 'error',
            message: 'Les paramètres de requête "query" et "type" sont obligatoires.'
        });
    }

    try {
        let results = [];
        let source = '';

        // --- Logique de routage par type ---
        if (contentType.toLowerCase() === 'anime') {
            console.log(`Recherche AniList pour : ${searchTerm}`);
            const anilistResult = await axios.post(ANILIST_API_URL, {
                query: ANILIST_SEARCH_QUERY,
                variables: { search: searchTerm }
            });
            results = anilistResult.data.data.Page.media;
            source = 'AniList';

        } else if (contentType.toLowerCase() === 'game') {
            // TODO: Intégrer ici l'appel à l'API IGDB pour les jeux
            results = [{ id: 0, title: { romaji: `Recherche de jeux pour: ${searchTerm}` }, message: "Intégration IGDB non implémentée, retourne un placeholder." }];
            source = 'Placeholder (Game)';

        } else if (contentType.toLowerCase() === 'film' || contentType.toLowerCase() === 'serie') {
            // TODO: Intégrer ici l'appel à l'API TMDB pour les films/séries
            results = [{ id: 0, title: { romaji: `Recherche de films/séries pour: ${searchTerm}` }, message: "Intégration TMDB non implémentée, retourne un placeholder." }];
            source = 'Placeholder (Film/Série)';
            
        } else {
            return response.status(404).json({ status: 'error', message: 'Type de contenu non supporté.' });
        }

        response.status(200).json({
            status: 'success',
            message: `Résultats de recherche pour "${searchTerm}" dans la catégorie ${contentType}.`,
            data: results,
            source: source
        });

    } catch (error) {
        console.error(`Erreur Backend (${contentType}):`, error.message);
        response.status(500).json({
            status: 'error',
            message: `Échec de la recherche de données pour ${contentType}.`,
            details: error.message
        });
    }
};
