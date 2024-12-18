const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Product,
  Category,
  Category_Product,
  Product_Inventory,
  Activity_Log,
} = require("../db/models/associations");
const Archive = require("../db/models/archive.model");

//Create Product
router.route("/create").post(async (req, res) => {
  try {
    const {
      sku,
      productnames,
      price,
      productImages,
      Threshold,
      userId,
      printable,
    } = req.body;
    const existingProduct = await Product.findOne({
      where: {
        // name: productnames,
        sku: sku,
      },
    });

    if (existingProduct) {
      return res.status(201).send("Exist");
    } else {
      const newData = await Product.create({
        name: productnames,
        price: price,
        sku: sku,
        image: productImages,
        threshold: Threshold,
        printable: printable,
      });

      const productId = newData.product_id;
      const selectedCategoryId = req.body.categorydata;
      // Loop through each selected category and create a Category_Product entry
      for (const categoryId of selectedCategoryId) {
        const newCategProduct = await Category_Product.create({
          product_id: productId,
          category_id: categoryId,
          status: "Active",
        });

        const IdCategprod = newCategProduct.id;

        // await Product_Inventory.create({
        //   // category_product_id: IdCategprod,
        //   product_id: productId,
        //   quantity: "0",
        //   price: price,
        // });
      }

      await Activity_Log.create({
        masterlist_id: userId,
        action_taken: `Product: Create a new product named ${productnames}`,
      });
      res.status(200).json(newData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

//Update product
router.route("/updateProduct").post(async (req, res) => {
  try {
    const {
      thirdColprodId,
      productprice,
      productName,
      productSKU,
      productspecificImage,
      productCategorySpecific,
      productThreshold,
      userId,
      printable,
    } = req.body;

    const existingDataCode = await Product.findOne({
      where: {
        sku: productSKU,
        product_id: { [Op.ne]: thirdColprodId },
      },
    });

    if (existingDataCode) {
      return res.status(201).send("Exist");
    } else {
      const existingProduct = await Product.findOne({
        where: { product_id: thirdColprodId },
      });

      let actionMessage = "Product: Update ";

      const changes = [];

      if (existingProduct.name !== productName) {
        changes.push(
          `product name from ${existingProduct.name} to ${productName}`
        );
      }
      if (existingProduct.price !== productprice) {
        changes.push(`price from ${existingProduct.price} to ${productprice}`);
      }
      if (existingProduct.sku !== productSKU) {
        changes.push(`SKU from ${existingProduct.sku} to ${productSKU}`);
      }
      if (existingProduct.threshold !== productThreshold) {
        changes.push(
          `threshold from ${existingProduct.threshold} to ${productThreshold}`
        );
      }
      if (existingProduct.image !== productspecificImage) {
        changes.push(`image`);
      }

      // Join all changes with commas
      actionMessage += changes.join(", ");

      await Product.update(
        {
          price: productprice,
          sku: productSKU,
          image: productspecificImage,
          name: productName,
          threshold: productThreshold,
          printable: printable,
        },
        {
          where: {
            product_id: thirdColprodId,
          },
        }
      );

      await Activity_Log.create({
        masterlist_id: userId,
        action_taken: actionMessage,
      });
    }

    const InactProd = await Category_Product.update(
      {
        status: "Inactive",
      },
      {
        where: {
          product_id: thirdColprodId,
        },
      }
    );

    if (InactProd) {
      const selectedCategory = productCategorySpecific;

      for (const categoryDropdown of selectedCategory) {
        const categoryValue = categoryDropdown.value;

        await Category_Product.update(
          {
            status: "Active",
          },
          {
            where: {
              product_id: thirdColprodId,
              category_id: categoryValue,
            },
          }
        );

        const findProd = await Category_Product.findAll({
          where: {
            product_id: thirdColprodId,
            category_id: categoryValue,
          },
        });

        if (findProd.length > 0) {
          // nothing
        } else {
          const NewcategProd = await Category_Product.create({
            category_id: categoryValue,
            product_id: thirdColprodId,
            status: "Active",
          });

          // await Product_Inventory.create({
          //   quantity: 0,
          //   category_product_id: newIdData,
          //   price: productprice,
          // });
        }
      }
    }

    return res.status(200).json();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

//For product input fields
router.route("/fetchupdateProduct").get(async (req, res) => {
  try {
    const { Idproduct } = req.query;
    const data = await Category_Product.findAll({
      include: [
        {
          model: Category,
          required: true,
        },
        {
          model: Product,
          required: true,
        },
      ],
      where: {
        product_id: Idproduct,
      },
    });
    return res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

//For multiselect dropdown category
router.route("/fetchSpecificProductCategory").get(async (req, res) => {
  try {
    const { Idproduct } = req.query;
    const data = await Category_Product.findAll({
      include: [
        {
          model: Category,
          required: true,
        },
        {
          model: Product,
          required: true,
        },
      ],
      where: {
        product_id: Idproduct,
        status: "Active",
      },
    });
    return res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// Fetch Product
router.route("/getProductCategories").get(async (req, res) => {
  try {
    const data = await Category_Product.findAll({
      include: [
        {
          model: Product,
          attributes: ["name", "image", "sku", "price"],
        },
        {
          model: Category,
          attributes: ["name"],
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/archive").put(async (req, res) => {
  try {
    const { thirdColprodId, remarks, userId } = req.body;

    const product = await Product.findOne({
      where: { product_id: thirdColprodId },
    });
    const productName = product.name;
    const productSKU = product.sku;

    await product.update({
      is_archived: true,
    });
    await Archive.create({
      archive_time: new Date(),
      remarks: remarks,
      product_id: thirdColprodId,
    });

    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Product: Archived. Name: ${productName}, SKU: ${productSKU}`,
    });

    res.status(200).send("Archived");
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/get-archive").get(async (req, res) => {
  try {
    const data = await Archive.findAll({
      include: {
        model: Product,
        attributes: ["name", "price"],
      },
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/un-archive/:id").put(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId;

    const product = await Product.findOne({
      where: { product_id: id },
    });

    const productName = product.name;
    const productSKU = product.sku;

    await product.update({
      is_archived: false,
    });
    await Archive.destroy({
      where: {
        product_id: id,
      },
    });

    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Product: Retrived. Name: ${productName}, SKU: ${productSKU}`,
    });
    res.send("UnArch");
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/getProducts").get(async (req, res) => {
  try {
    const product = await Product.findAll();

    if (product) {
      return res.json(product);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

module.exports = router;
