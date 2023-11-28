const multer = require('multer');
const azure = require('azure-storage');
const storageAccount = 'storeimagesinazure';
const storageAccessKey = 'BTzBs36CoQOBrRsjeA+VViNVNiMIn1aH0QXN/KshGf2+qPGpMVcTbwCe8lo8ZcQUBBS+aOVzgRDs+ASt7/NMFw==';
// Create a multer storage for handling image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const blobService = azure.createBlobService(storageAccount, storageAccessKey);


// Define the API endpoint for uploading images
// app.post('/api/uploadImage', upload.single('image'), (req, res) => {
//     const containerName = 'festival';
//     const folder = 'images';
//     const subfolder = 'diwali';
//     const imageName = 'diwali-image.jpg';
  
//     const blobName = `${imageName}`;
  
//     // Upload the image to Azure Blob Storage
//     blobService.createBlockBlobFromStream(containerName, blobName, req.file.buffer, req.file.size, (error, result, response) => {
//       if (!error) {
//         res.status(200).send('Image uploaded to Azure Blob Storage.');
//       } else {
//         res.status(500).send('Error uploading image to Azure Blob Storage.');
//       }
//     });
//   });

  //_______________________________________________________________________________
  // Define the API endpoint to access images in a specific container
const getContainer = async function(req, res) {
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
          images: blobList
        });
      } else {
        res.status(500).send('Error listing container images');
      }
    });
}
//________________________________________________get image with container name________________

// Define the API endpoint to access images
const getImage = async function(req, res){
    const { container, image } = req.params;
    // const blobName = `${image}`;
  console.log(`${container},"=================", ${image}`);
    // Generate the URL to the Azure Blob
    const imageUrl = blobService.getUrl(container, image);
  
    // Redirect the user to the Azure Blob URL
    res.redirect(imageUrl);
  };

  // __________________________get mrng, afternoon and night images____________________

const getDailyImages = async function (req, res) {
    try {
      let containerNames = req.params.containerNames;
      if (containerNames && containerNames.toLowerCase() === "dailydata") {
        containerNames = ['morning', 'afternoon', 'night', 'evening'];
      } else {
        res.status(400).send({ status: false, msg: "Provide valid input" });
        return; 
      }
  
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
              console.error(`Error listing container images for ${containerName}: ${error.message}`);
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
  
          res.status(200).json({ DailyData: responseArray });
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Error fetching container images');
        });
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: false, message: error.message });
    }
  };
  
  
  module.exports ={getContainer, getImage, getDailyImages}
  