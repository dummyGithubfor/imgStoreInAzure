const express = require("express");

const imageUploadController = require("../controller/imageUploadingController");
const Router = express.Router();

// Router.post("/register", adminController.createAdmin);
Router.get("/api/:containerName", imageUploadController.getContainer);
Router.get("/api/images/:container/:image", imageUploadController.getImage);
Router.get("/api/fullDayImages/:containerNames", imageUploadController.getDailyImages);

Router.all("/**", function (req, res) {
    res.status(404).send({
      status: false,
      message: "Make Sure Your Endpoint is Correct or Not!",
    });
  });
  
  module.exports = Router;