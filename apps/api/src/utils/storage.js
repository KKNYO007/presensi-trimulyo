const supabase = require('../lib/supabase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * Upload a file to Supabase Storage
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} bucket - The bucket name (selfies or activities)
 * @param {string} originalName - Original filename to get extension
 * @returns {Promise<string>} The public URL of the uploaded file
 */
async function uploadToSupabase(fileBuffer, bucket, originalName) {
    const ext = path.extname(originalName);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = fileName; // We can just use the filename in the root of the bucket

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
            contentType: getContentType(ext),
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        throw new Error(`Gagal mengunggah file ke Supabase: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
}

/**
 * Helper to get content type based on extension
 */
function getContentType(ext) {
    switch (ext.toLowerCase()) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.webp':
            return 'image/webp';
        default:
            return 'application/octet-stream';
    }
}

module.exports = {
    uploadToSupabase
};
