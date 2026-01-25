import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { path: filePath } = req.query;
  const fullPath = path.join(process.cwd(), 'uploads', ...filePath);

  try {
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      const fileBuffer = fs.readFileSync(fullPath);
      
      // Set appropriate content type based on file extension
      const ext = path.extname(fullPath).toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.webp':
          contentType = 'image/webp';
          break;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(fileBuffer);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}