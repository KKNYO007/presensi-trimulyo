require('dotenv').config();

module.exports = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3001,

    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-me',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },

    office: {
        lat: parseFloat(process.env.OFFICE_LAT) || -7.682067371531455,
        lng: parseFloat(process.env.OFFICE_LNG) || 110.35755937948723,
        maxDistanceKm: parseFloat(process.env.MAX_DISTANCE_KM) || 2.0,
    },

    upload: {
        maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5,
        uploadDir: process.env.UPLOAD_DIR || 'uploads',
    },

    supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
    }
};
