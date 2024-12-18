const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const { Kiosk_Img } = require("../db/models/associations");

router.route("/save_kiosk_image").post(async (req, res) => {
  try {
    const { images, userType, locType } = req.body;

    const imgLength = await Kiosk_Img.findAll({
      where: {
        uploaded_by: { [Op.ne]: "Superadmin" },
        img_screen_loc: locType,
      },
    });

    console.log(imgLength.length, images.length);

    if (images.length + imgLength.length > 4 && userType != "Superadmin") {
      return res.status(201).send({ message: "Exceed" });
    }

    let imageEntries;

    if (locType == "kiosk-main") {
      imageEntries = images.map((image) => ({
        kiosk_img: image.base64,
        img_screen_loc: locType,
        uploaded_by: userType,
        type: image.type,
      }));
    } else {
      imageEntries = images.map((image) => ({
        kiosk_img: image,
        img_screen_loc: locType,
        uploaded_by: userType,
        type: "image/png",
      }));
    }

    await Kiosk_Img.bulkCreate(imageEntries);

    res.status(200).send({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/fetchKioskImgs").get(async (req, res) => {
  try {
    const data = await Kiosk_Img.findAll({
      where: {
        img_screen_loc: "kiosk-main",
      },
    });

    if (data) {
      res.send(data);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/fetchKioskImgsBanner").get(async (req, res) => {
  try {
    const data = await Kiosk_Img.findAll({
      where: {
        img_screen_loc: "banner",
      },
    });

    if (data) {
      res.send(data);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/editKioskImgs").put(async (req, res) => {
  try {
    const { id, img, type } = req.body;

    console.log(req.body);

    await Kiosk_Img.update(
      {
        kiosk_img: img,
        type: type,
      },
      {
        where: {
          kiosk_img_id: id,
        },
      }
    );

    res.status(200).send("Edit");
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/deleteKioskImgs").delete(async (req, res) => {
  try {
    const { img_id } = req.body;

    console.log(req.body);

    await Kiosk_Img.destroy({
      where: {
        kiosk_img_id: img_id,
      },
    });

    res.status(200).send("Deleted");
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

module.exports = router;
