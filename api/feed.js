// Ceci est une fonction Vercel, qui remplace la Firebase Cloud Function.
// Elle ne peut pas utiliser Firestore pour le cache, donc elle appelle AniList à chaque fois.

const axios = require('axios');

const ANILIST_API_URL = 'https://graphql.anilist.co';

// Requête GraphQL pour récupérer les animes populaires
const ANILIST_QUERY = `
  query PopularAnime {
    Page(page: 1, perPage: 10) {
      media(sort: POPULARITY_DESC, type: ANIME) {
        id
        title {
          romaji
        }
        description(asHtml: false)
        trailer {
          id
          site
        }
        coverImage {
          extraLarge
        }
        averageScore
        episodes
      }
    }
  }
`;

// L'exportation par défaut est l'équivalent de exports.getAnimeFeed dans Firebase
module.exports = async (request, response) => {
    // Configuration de CORS (essentiel pour que le Frontend puisse appeler cette fonction)
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Gérer les requêtes OPTIONS
    if (request.method === 'OPTIONS') {
        return response.status(204).send('');
    }

    try {
        console.log("Appel à l'API AniList...");
        
        const result = await axios.post(ANILIST_API_URL, {
            query: ANILIST_QUERY,
        });

        const animeData = result.data.data.Page.media;

        response.status(200).json({
            status: 'success',
            message: 'Données AniList récupérées.',
            data: animeData
        });

    } catch (error) {
        console.error("Erreur Backend (AniList):", error.message);
        response.status(500).json({
            status: 'error',
            message: 'Échec de la récupération des données.',
            details: error.message
        });
    }
};
