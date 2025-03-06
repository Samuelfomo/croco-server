const jwt = require('jsonwebtoken');
const jwtConfig = require('./jwt');
const R = require('../lib/tool/Reply');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return R.handleError(res, 'authorization_required', 401);
    }
    const token = authHeader.split(' ')[1];

    try {
        req.user = jwt.verify(token, jwtConfig.token.secret);
        next();
    } catch (error) {
        return R.handleError(res, 'invalid_token', 403);
    }
};
// const verifyToken = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return R.handleError(res, 'authorization_required', 401);
//     }
//     const token = authHeader.split(' ')[1];
//
//     try {
//         // Décoder le token et stocker les informations dans req.user
//         const decoded = jwt.verify(token, jwtConfig.token.secret);
//
//         // Stocker tout le contenu décodé dans req.user
//         req.user = decoded;
//
//         // Pour le débogage, vous pouvez afficher l'UUID
//         console.log('Token décodé avec succès, UUID:', decoded.uuid);
//
//         next();
//     } catch (error) {
//         console.error('Erreur de vérification du token:', error.message);
//         return R.handleError(res, 'invalid_token', 403);
//     }
// };
module.exports = verifyToken;