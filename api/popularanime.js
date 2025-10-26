// Fonction pour récupérer les animes populaires Vercel.
// Elle retourne les animes populaires du moment avec leurs informations détaillées.

const axios = require('axios');
const ANILIST_API_URL = 'https://graphql.anilist.co';

// Requête GraphQL pour récupérer les animes populaires
const POPULAR_ANIME_QUERY = `
  query PopularAnime {
    Page(page: 1, perPage: 20) {
      media(sort: POPULARITY_DESC, type: ANIME, status: RELEASING) {
        id
        title { romaji english }
        description(asHtml: false)
        trailer {
          id
          site
          thumbnail
        }
        coverImage { extraLarge }
        bannerImage
        averageScore
        episodes
        genres
        siteUrl
        status
        format
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
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

    try {
        console.log('Récupération des animes populaires...');
        const anilistResult = await axios.post(ANILIST_API_URL, {
            query: POPULAR_ANIME_QUERY
        });
        console.log('Réponse AniList:', anilistResult.data);
        
        const results = anilistResult.data.data.Page.media;

        response.status(200).json({
            status: 'success',
            message: 'Animes populaires récupérés avec succès.',
            data: results,
            source: 'AniList'
        });

    } catch (error) {
        console.error('Erreur Backend (Popular Anime):', error.message);
        response.status(500).json({
            status: 'error',
            message: 'Échec de la récupération des animes populaires.',
            details: error.message
        });
    }
};
