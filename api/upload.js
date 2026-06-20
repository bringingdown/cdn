import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = {
    api: { bodyParser: false },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

    const form = formidable({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ error: 'gagal parse: ' + err.message });

        try {
            const file = Array.isArray(files.file) ? files.file[0] : files.file;
            if (!file) return res.status(400).json({ error: 'file tidak ditemukan' });

            const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
            const apiKey = process.env.CLOUDINARY_API_KEY;
            const apiSecret = process.env.CLOUDINARY_API_SECRET;

            const timestamp = Math.floor(Date.now() / 1000);
            const crypto = await import('crypto');
            const signature = crypto.default
                .createHash('sha1')
                .update(`timestamp=${timestamp}${apiSecret}`)
                .digest('hex');

            const bodyFormData = new FormData();
            bodyFormData.append('file', fs.createReadStream(file.filepath));
            bodyFormData.append('api_key', apiKey);
            bodyFormData.append('timestamp', timestamp);
            bodyFormData.append('signature', signature);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                method: 'POST',
                body: bodyFormData,
                headers: bodyFormData.getHeaders()
            });

            const data = await response.json();

            if (data.secure_url) {
                const format = data.format ? `.${data.format}` : '';
                const publicId = data.public_id;
                return res.status(200).json({ 
                    url: `/file/${publicId}${format}`,
                    full_url: `https://santana-cdn.web.id/file/${publicId}${format}`
                });
            }

            return res.status(500).json({ error: JSON.stringify(data) });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    });
}
