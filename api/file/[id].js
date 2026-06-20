import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { id } = req.query;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mp3', 'pdf', 'zip'];
    const ext = id.split('.').pop().toLowerCase();
    
    const resourceType = ['mp4', 'mp3', 'pdf', 'zip'].includes(ext) ? 
        (ext === 'mp3' ? 'video' : 'raw') : 'image';
    
    const targetUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${id}`;

    try {
        const response = await fetch(targetUrl);
        if (!response.ok) return res.status(404).send('file tidak ditemukan');

        res.setHeader('Content-Type', response.headers.get('content-type'));
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        response.body.pipe(res);
    } catch (e) {
        res.status(500).send('error: ' + e.message);
    }
}
