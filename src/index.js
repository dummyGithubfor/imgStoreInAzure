// const azure = require('azure-storage');
// const express = require('express');
// const app = express();
// const fs = require('fs');

// const storageAccount = 'storeimagesinazure1';
// const storageAccessKey = 'BTzBs36CoQOBrRsjeA+VViNVNiMIn1aH0QXN/KshGf2+qPGpMVcTbwCe8lo8ZcQUBBS+aOVzgRDs+ASt7/NMFh==';

// const blobService = azure.createBlobService(storageAccount, storageAccessKey);

// const containers = ['morning', 'afternoon', 'festival'];


// containers.forEach((containerName) => {
//     blobService.createContainerIfNotExists(containerName, { publicAccessLevel: 'blob' }, (error, result, response) => {
//       if (!error) {
//         console.log(`Container "${containerName}" exists or was created successfully.`);
//       } else {
//         console.error(`Error creating container: ${error}`);
//       }
//     });
//   });

// // Create a list of festivals
// const festivals = ['diwali', 'dussehra', 'ganesh-chaturthi', 'navratri'];

// festivals.forEach((festivalName) => {
//   const festivalContainerName = 'festival';

//   // Specify a unique subfolder name for each festival
//   const subfolderName = festivalName;

//   blobService.createContainerIfNotExists(subfolderName, { publicAccessLevel: 'blob' }, (error, result, response) => {
//     if (!error) {
//       console.log(`Subfolder "${subfolderName}" in "${festivalContainerName}" container exists or was created successfully.`);
//     } else {
//       console.error(`Error creating subfolder: ${error}`);
//     }
//   });
// });
// function uploadImage(containerName, folder, subfolder, imageName, localImagePath) {
//   const blobName = `${folder}/${subfolder}/${imageName}`;

//   blobService.createBlockBlobFromLocalFile(containerName, blobName, localImagePath, (error, result, response) => {
//     if (!error) {
//       console.log(`Image "${imageName}" uploaded to "${containerName}" container.`);
//     } else {
//       console.error(`Error uploading image: ${error}`);
//     }
//   });
// }

// // Usage: Upload an image from your local computer to Azure Blob Storage
// uploadImage('festival', 'images', 'diwali', 'diwali-image.jpg', 'G:\\container\\festival\\diwali\\diwali-image.jpg');

// // Define an API endpoint to get images
// app.get('/api/images/:container/:folder/:subfolder/:image', (req, res) => {
//   const { container, folder, subfolder, image } = req.params;
//   const blobName = `${folder}/${subfolder}/${image}`;
//   const imageUrl = blobService.getUrl(container, blobName);
//   res.send(imageUrl);
// });

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

//_________________________api________________________________________________________________

const azure = require('azure-storage');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const multer = require('multer');
const axios = require('axios');
const cheerio = require('cheerio');
const storageAccount = 'storeimagesinazure';
const storageAccessKey = 'BTzBs36CoQOBrRsjeA+VViNVNiMIn1aH0QXN/KshGf2+qPGpMVcTbwCe8lo8ZcQUBBS+aOVzgRDs+ASt7/NMFw==';
const route = require('./route/routes');

app.use(express.json());
// app.use(cors());

app.use('/', route);

mongoose.set('strictQuery', false);

// MongoDB connection
mongoose
  .connect("mongodb+srv://nikita1:7CSKh9nBmgBm27YC@cluster0.suzof1p.mongodb.net/imageUploading", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB is connected for local');
  });
const blobService = azure.createBlobService(storageAccount, storageAccessKey);

const containers = ['morning', 'afternoon', 'festival', 'evening', 'namebackground', 'night'];

containers.forEach((containerName) => {
  blobService.createContainerIfNotExists(containerName, { publicAccessLevel: 'blob' }, (error, result, response) => {
    if (!error) {
      console.log(`Container "${containerName}" exists or was created successfully.`);
    } else {
      console.error(`Error creating container: ${error}`);
    }
  });
});

// Create a list of festivals
const festivals = ['diwali', 'dussehra', 'ganeshchaturthi', 'navratri'];

festivals.forEach((festivalName) => {
  const festivalContainerName = 'festival';

  // Specify a unique subfolder name for each festival
  const subfolderName = festivalName;

  blobService.createContainerIfNotExists(subfolderName, { publicAccessLevel: 'blob' }, (error, result, response) => {
    if (!error) {
      console.log(`Subfolder "${subfolderName}" in "${festivalContainerName}" container exists or was created successfully.`);
    } else {
      console.error(`Error creating subfolder: ${error}`);
    }
  });
});

// Create a multer storage for handling image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });







const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
