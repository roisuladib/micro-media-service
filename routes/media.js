const express = require('express');
const router = express.Router();
const isBase64 = require('is-base64');
const base64Img = require('base64-img');
const { Media } = require('../models');
const fs = require('fs');

// getAll
router.get('/', async (req, res) => {
  const media = await Media.findAll({
    attributes: ['id', 'image']
  });
  const mappedMedia = media.map((i) => {
    i.image = `${req.get('host')}/${i.image}`;
    return i;
  })
  return res.json({
    status: 'success',
    message: 'List Data Image',
    data: mappedMedia
  });
});

// Upload Image
router.post('/upload', (req, res) => {
  const image = req.body.image;
  if (!isBase64(image, { mimeRequired: true })) {
    return res.status(400).json({
        status: 'error',
        message: 'Invalid base64'
    });
  }
  base64Img.img(image, './public/images', Date.now(), async (err, filepath) => {
    if (err) { 
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
    const filename = filepath.split('/').pop();
    const media = await Media.create({ image: `images/${filename}` });
    return res.json({
      status: 'success',
      data: {
        id: media.id,
        image: `${req.get('host')}/images/${filename}`  
      }
    });
  });
});

// Delete Image
router.delete('/delete/:id', async (req, res) => {
  const id = req.params.id;
  const media = await Media.findByPk(id);
  if (!media) {
    return res.status(404).json({
      status: 'error',
      message: 'Media Not Found !'
    });
  }
  fs.unlink(`./public/${media.image}`, async (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
    await media.destroy();
    return res.json({
      status: 'success',
      message: 'Image Deleted!'
    })
  });
});

module.exports = router;
