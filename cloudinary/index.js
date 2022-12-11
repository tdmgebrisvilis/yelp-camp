// syntax from multer-storage-cloudinary docs
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// syntax from cloudinary docs, except the secret 'process.env' stuff, which is from the .env file.
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
  });

// syntax from multer-storage-cloudinary docs. This is for the storage of files.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'YelpCamp',
    alloweFormats: ['jpeg', 'png', 'jpg'],
  },
});

// Exports
module.exports = {
  cloudinary,
  storage
}