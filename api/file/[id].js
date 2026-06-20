import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { id } = req.query;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const targetUrl = `https://res.cloudinary.com/${cloudName}/auto/upload/${id}`;

    try {
        const response = await fetch(targetUrl);
        if (!response.ok) return res.status(404).send('file tidak ditemukan');

        res.setHeader('Content-Type', response.headers.get('content-type'));
        response.body.pipe(res);
    } catch (e) {
        res.status(500).send('error: ' + e.message);
    }
}
