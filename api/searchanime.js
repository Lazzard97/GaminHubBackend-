// Fonction de recherche d'animes Vercel.
// Elle accepte les paramètres 'query' (le terme de recherche) pour rechercher des animes via AniList.

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

    // Extraction du paramètre 'query'
    const url = require('url');
    const parsedUrl = url.parse(request.url, true);
    const searchTerm = parsedUrl.query.query;

    console.log('Paramètres reçus:', { searchTerm });

    if (!searchTerm) {
        console.log('Paramètre manquant:', { searchTerm });
        return response.status(400).json({
            status: 'error',
            message: 'Le paramètre de requête "query" est obligatoire.'
        });
    }

    try {
        console.log(`Recherche AniList pour : ${searchTerm}`);
        const anilistResult = await axios.post(ANILIST_API_URL, {
            query: ANILIST_SEARCH_QUERY,
            variables: { search: searchTerm }
        });
        console.log('Réponse AniList:', anilistResult.data);
        
        const results = anilistResult.data.data.Page.media;

        response.status(200).json({
            status: 'success',
            message: `Résultats de recherche d'animes pour "${searchTerm}".`,
            data: results,
            source: 'AniList'
        });

    } catch (error) {
        console.error('Erreur Backend (Anime):', error.message);
        response.status(500).json({
            status: 'error',
            message: 'Échec de la recherche d\'animes.',
            details: error.message
        });
    }
};
