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
const app = express();
const multer = require('multer');
const { isSameDay } = require('date-fns');
const storageAccount = 'storeimagesinazure';
const storageAccessKey = 'BTzBs36CoQOBrRsjeA+VViNVNiMIn1aH0QXN/KshGf2+qPGpMVcTbwCe8lo8ZcQUBBS+aOVzgRDs+ASt7/NMFw==';

const blobService = azure.createBlobService(storageAccount, storageAccessKey);

const containers = ['morning', 'afternoon', 'festival'];

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
const festivals = ['diwali', 'dussehra', 'ganesh-chaturthi', 'navratri'];

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

// Define the API endpoint for uploading images
app.post('/api/uploadImage', upload.single('image'), (req, res) => {
  const containerName = 'festival';
  const folder = 'images';
  const subfolder = 'diwali';
  const imageName = 'diwali-image.jpg';

  const blobName = `${imageName}`;

  // Upload the image to Azure Blob Storage
  blobService.createBlockBlobFromStream(containerName, blobName, req.file.buffer, req.file.size, (error, result, response) => {
    if (!error) {
      res.status(200).send('Image uploaded to Azure Blob Storage.');
    } else {
      res.status(500).send('Error uploading image to Azure Blob Storage.');
    }
  });
});

// Define the API endpoint to access images
app.get('/api/images/:container/:image', (req, res) => {
  const { container, image } = req.params;
  // const blobName = `${image}`;

  // Generate the URL to the Azure Blob
  const imageUrl = blobService.getUrl(container, image);

  // Redirect the user to the Azure Blob URL
  res.redirect(imageUrl);
});


// Define the API endpoint to access images in a specific container
app.get('/api/containerImages/:containerName', (req, res) => {
  const containerName = req.params.containerName;

  // List all blobs in the specified container
  blobService.listBlobsSegmented(containerName, null, (error, result, response) => {
    if (!error) {
      const blobList = result.entries.map(entry => {
        const imageUrl = blobService.getUrl(containerName, entry.name);
        return imageUrl;
      });
      res.json({upcomingFestivals:blobList});
    } else {
      res.status(500).send('Error listing container images');
    }
  });
});


// __________________________get mrng, afternoon and night images____________________
app.get('/api/fullDayImages', (req, res) => {
  // const containerNames = req.params.containerNames.split(',');
const containerNames = [ 'morning', 'night', 'afternoon' ];
  const fetchImages = (containerName) => {
    return new Promise((resolve, reject) => {
      blobService.listBlobsSegmented(containerName, null, (error, result, response) => {
        if (!error) {
          const blobList = result.entries.map(entry => {
            const imageUrl = blobService.getUrl(containerName, entry.name);
            return imageUrl;
          });
          resolve({ containerName, images: blobList });
        } else {
          reject(`Error listing container images for ${containerName}`);
        }
      });
    });
  };

  // Fetch images for each container concurrently using Promise.all
  Promise.all(containerNames.map(fetchImages))
    .then(results => {
      const responseObj = {};
      results.forEach(result => {
        responseObj[result.containerName] = result.images;
      });
      res.json(responseObj);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error fetching container images');
    });
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
