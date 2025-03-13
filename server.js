const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable = require('formidable'); // Add formidable to handle file uploads

// Create server
const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/upload') {
        // Handle file upload
        const form = new formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, 'uploads'); // Directory where files will be saved
        form.keepExtensions = true; // Keep file extensions

        form.parse(req, (err, fields, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`<h1>Server Error: ${err.message}</h1>`);
                return;
            }

            // Validate the uploaded file type
            const uploadedFile = files.file[0];
            const mimeType = mime.lookup(uploadedFile.originalFilename);

            // Check for allowed file types (e.g., images, text files)
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain'];
            if (!allowedMimeTypes.includes(mimeType)) {
                fs.unlinkSync(uploadedFile.filepath); // Delete the invalid file
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('<h1>Invalid file type. Only image files and text files are allowed.</h1>');
                return;
            }

            // File upload successful
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<h1>File uploaded successfully!</h1><p>File name: ${uploadedFile.originalFilename}</p>`);
        });
    } else {
        // Serve the static files (index.html)
        let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 - File Not Found</h1>', 'utf8');
                } else {
                    res.writeHead(500);
                    res.end(`Server Error: ${err.code}`);
                }
            } else {
                res.writeHead(200, { 'Content-type': mime.lookup(filePath) });
                res.end(content, 'utf8');
            }
        });
    }
});

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
