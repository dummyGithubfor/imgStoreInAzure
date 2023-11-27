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
const axios = require('axios');
const cheerio = require('cheerio');

const storageAccount = 'storeimagesinazure';
const storageAccessKey = 'BTzBs36CoQOBrRsjeA+VViNVNiMIn1aH0QXN/KshGf2+qPGpMVcTbwCe8lo8ZcQUBBS+aOVzgRDs+ASt7/NMFw==';

const blobService = azure.createBlobService(storageAccount, storageAccessKey);

const containers = ['morning', 'afternoon', 'festival', 'evening', 'namebaground'];

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
app.get('/api/:containerName', (req, res) => {
  const containerName = req.params.containerName;

  // List all blobs in the specified container
  blobService.listBlobsSegmented(containerName, null, (error, result, response) => {
    if (!error) {
      const blobList = result.entries.map(entry => {
        const imageUrl = blobService.getUrl(containerName, entry.name);
        return imageUrl;
      });
      res.status(200).json({
        containerName: containerName,
        blobList: blobList
      });
    } else {
      res.status(500).send('Error listing container images');
    }
  });
});


// __________________________get mrng, afternoon and night images____________________
app.get('/api/fullDayImages', (req, res) => {
  // const containerNames = req.params.containerNames.split(',');
const containerNames = [ 'morning', 'night', 'afternoon', 'evening'];
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
    const responseArray = results.map(result => ({
      containerName: result.containerName,
      images: result.images,
    }));

    res.status(200).json({DailyData: responseArray});
  })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error fetching container images');
    });
});

// app.get('/api/upcomingFestival', (req, res) => {
//   // const containerNames = req.params.containerNames.split(',');
//   const currentDate = new Date();
//   const festivalDate = new Date('2023-12-25');
// let containerNames = [];
// if (isSameDay(currentDate, festivalDate)) {
//   console.log('Today is a festival day!');
//   containerNames.unshift()

// } else {
//   console.log('Today is not a festival day.');
// }
// // const containerNames = [ 'morning', 'night', 'afternoon' ];
//   const fetchImages = (containerName) => {
//     return new Promise((resolve, reject) => {
//       blobService.listBlobsSegmented(containerName, null, (error, result, response) => {
//         if (!error) {
//           const blobList = result.entries.map(entry => {
//             const imageUrl = blobService.getUrl(containerName, entry.name);
//             return imageUrl;
//           });
//           resolve({ containerName, images: blobList });
//         } else {
//           reject(`Error listing container images for ${containerName}`);
//         }
//       });
//     });
//   };

//   // Fetch images for each container concurrently using Promise.all
//   Promise.all(containerNames.map(fetchImages))
//     .then(results => {
//       const responseObj = {};
//       results.forEach(result => {
//         responseObj[result.containerName] = result.images;
//       });
//       res.json(responseObj);
//     })
//     .catch(error => {
//       console.error(error);
//       res.status(500).send('Error fetching container images');
//     });
// });

//________________________get all festival________________
// async function getHinduHolidays(year) {
//   try {
//     const response = await axios.get(`https://www.calendarlabs.com/holidays/hindu/${year}`);
//     console.log(response,"================================response");
//     const $ = cheerio.load(response.data);

//     // Adjust the CSS selector based on the website structure
//     const holidayElements = $('.tableholidays tr:not(:first-child)');

//     const holidays = holidayElements.map((index, element) => {
//       const holidayName = $(element).find('td:nth-child(2)').text().trim();
//       return holidayName;
//     }).get();

//     return holidays.length > 0 ? holidays : ['No holidays found'];
//   } catch (error) {
//     console.error('Error fetching data:', error.message);
//     return ['Error fetching data'];
//   }
// }

// const year = 2023; // Replace with your desired year
// getHinduHolidays(year).then((result) => {
//   console.log(`Hindu holidays in ${year}:`);
//   result.forEach((holiday, index) => {
//     console.log(`${index + 1}. ${holiday}`);
//   });
// });

// const axios = require('axios');

// const options = {
//   method: 'GET',
//   url: 'https://holidayapi1.p.rapidapi.com/holidays',
//   params: {
//     year: '2023',
//     country: 'India',
//     pretty: '0',
//     format: 'json'
//   },
//   headers: {
//     'X-RapidAPI-Key': '182092073dmshb5c0e7c14aa6758p11c2b4jsn5821bd9b73f1',
//     'X-RapidAPI-Host': 'holidayapi1.p.rapidapi.com'
//   }
// };

// const Holidays = require('date-holidays');
// app.get('/api/upcomingFestival', async(req, res) => {
// try {
// 	// const response = await axios.request(options);
//   // Create an instance for India
// const holidays = new Holidays('CA');

// // Specify the year for which you want to get holidays
// const year = 2023; // Replace with your desired year

// // Get the list of holidays for the specified year
// const indiaHolidays = holidays.getHolidays(year);

// console.log(`Indian holidays in ${year}:`);
// console.log(indiaHolidays, "========================festivals");
// res.status(200).send(indiaHolidays);
// } catch (error) {
// 	console.error(error);
//   res.status(500).send({status:false, message:error.message});
// }
// });
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
