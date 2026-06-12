const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3');
const fs = require('fs');
const path = require('path');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'ems-documents-bucket';

const uploadFile = async (file) => {
  // Check if credentials are mock/missing to trigger local storage fallback
  if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'mock-key') {
    console.warn('AWS S3 credentials not configured. Storing file locally...');
    
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const localPath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
    fs.writeFileSync(localPath, file.buffer);
    
    // Return relative URL path for dev testing
    return `/uploads/${path.basename(localPath)}`;
  }

  // AWS SDK V3 Upload
  const fileKey = `${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
  } catch (error) {
    console.error('AWS S3 Upload Error:', error.message, 'Falling back to local storage...');
    
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const localPath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
    fs.writeFileSync(localPath, file.buffer);
    
    // Return relative URL path for dev testing
    return `/uploads/${path.basename(localPath)}`;
  }
};

module.exports = { uploadFile };
