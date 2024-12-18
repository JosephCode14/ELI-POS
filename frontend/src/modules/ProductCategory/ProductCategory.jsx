import React, { useEffect, useState, useRef } from "react";
import _Sidebar from "../Sidebar/_Sidebar";
import "../styles/product-category.css";
// import "../styles/pos_react.css";
// import sample from "../../assets/image/posImg.jpg";
// import Select from "react-select";
// import productUnits from "../../assets/global/unit";
import noData from "../../assets/icon/no-data.png";
import Noimg from "../../assets/image/noimg.png";
import { Button, Modal } from "react-bootstrap";
import swal from "sweetalert";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { HiMiniPencilSquare } from "react-icons/hi2";
import BASE_URL from "../../assets/global/url";
import { useParams } from "react-router-dom";
import { Image } from "@phosphor-icons/react";
import { MultiSelect } from "primereact/multiselect";
import NoAccess from "../../assets/image/NoAccess.png";
import { jwtDecode } from "jwt-decode";
import { FourSquare } from "react-loading-indicators";
import ReactLoading from "react-loading";
const ProductCategory = ({ authrztn }) => {
  const { id } = useParams();
  const [userId, setuserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const handleCloseArchiveModal = () => {
    setShowArchiveModal(false);
    setRemarks("");
  };
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editProducts, setEditProducts] = useState(null);
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
  const [categId, setCategId] = useState("");
  const [fetchCategory, setFetchCategory] = useState([]);
  const [Products, setProduct] = useState([]);
  const [productprice, setProductprice] = useState("");
  const [productName, setProductName] = useState("");
  const [productSKU, setproductSKU] = useState("");
  const [productspecificImage, setProductspecificImage] = useState("");
  // const [productUnit, setProductUnit] = useState("");
  const [productThreshold, setProductThreshold] = useState("");
  const [productCategorySpecific, setProductCategorySpecific] = useState([]);
  const [thirdColprodId, setthirdColprodId] = useState("");
  const [CategoryProducts, setCategoryProduct] = useState([]);
  const [categorydata, setCategoryData] = useState([]);
  const [sku, setSku] = useState("");
  const [productnames, setproductNames] = useState(""); //create of product names
  const [price, setPrice] = useState("");
  const [printable, setPrintable] = useState(false);
  // const [unit, setUnit] = useState("");
  const [Threshold, setThreshold] = useState("");
  const [validated, setValidated] = useState(false);
  const [Category, setCategory] = useState([]); //lahat ng category fetch

  const [show, setShow] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryValid, setCategoryValid] = useState(true);

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [processLabel, setProcessLabel] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCancelAddProduct = (e) => {
    e.preventDefault();
    setShowAddProduct(false);
    setSku("");
    setCategoryData([]);
    setproductNames("");
    setPrice("");
    setThreshold("");
    setPrintable(false);
    setproductImages("");
    setShowAddProductModal(false);
  };

  useEffect(() => {
    const filtered = Products.filter((data) =>
      data.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, Products]);

  useEffect(() => {
    console.log(categorydata);
  }, [categorydata]);

  // const handleClose = () => setShow(false);

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  useEffect(() => {
    decodeToken();
  }, []);

  // const handleUnitChange = (e) => {
  //   const selectedUnit = e.target.value;
  //   const unitWithoutParentheses = selectedUnit.replace(/\s*\(.*?\)\s*/g, ""); // Remove text inside parentheses
  //   setUnit(unitWithoutParentheses);
  // };

  //   Add Category Modal
  const handleCloseCategoryModal = () => setShowAddCategoryModal(false);
  const handleShowCategoryModal = () => setShowAddCategoryModal(true);

  //   Edit Category Modal
  const handleCloseEditCategoryModal = () => setShowEditCategoryModal(false);
  const [editCategory, setEditCategory] = useState({
    name: "",
    category_image: null,
    category_id: null,
    time_from: null,
    time_to: null,
  });

  const handleTimeChange = (e, field) => {
    setEditCategory({
      ...editCategory,
      [field]: e.target.value,
    });
  };

  const handleDeleteImageCategory = () => {
    setEditCategory({ ...editCategory, category_image: null });
  };

  const fileUpdateInputRefs = useRef(null);

  function selectUpdateCategoryImage() {
    fileUpdateInputRefs.current.click();
  }

  const handleImageCategoryChange = (event) => {
    const updatecategoryImage = event.target.files[0];
    const allowedfileTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    const maximageSize = 5 * 1024 * 1024; // 5MB LIMIT

    if (
      updatecategoryImage &&
      allowedfileTypes.includes(updatecategoryImage.type) &&
      updatecategoryImage.size <= maximageSize
    ) {
      const reader = new FileReader();
      reader.readAsDataURL(updatecategoryImage);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        setEditCategory({ ...editCategory, category_image: base64String });
      };
    } else {
      swal({
        icon: "error",
        title: "File Selection Error",
        text: "Please select a valid image file (PNG, JPEG, JPG, or WEBP) with a maximum size of 5MB.",
      });
    }
  };

  const handleShowEditCategoryModal = (updateData = null) => {
    setShowEditCategoryModal(!showEditCategoryModal);
    if (updateData) {
      if (isStudentMeal(updateData.name)) {
        setEditCategory({
          name: updateData.name,
          category_image: updateData.category_image,
          category_id: updateData.category_id,
          time_from: updateData.time_from,
          time_to: updateData.time_to,
        });
      } else {
        setEditCategory({
          name: updateData.name,
          category_image: updateData.category_image,
          category_id: updateData.category_id,
          time_from: null,
          time_to: null,
        });
      }

      setCategId(updateData.category_id);
    } else {
      setEditCategory({
        name: "",
        category_image: null,
        category_id: null,
      });
    }
  };

  const isStudentMeal = (categoryName) => {
    return (
      categoryName === "Student Meal - Breakfast" ||
      categoryName === "Student Meal - Lunch" ||
      categoryName === "Student Meal - Dinner"
    );
  };

  const handleCategoryUpdate = (e) => {
    const { name, value } = e.target;
    setEditCategory((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (editCategory.name.trim() === "") {
      swal({
        icon: "error",
        title: "Category Name is required",
        text: "Please enter a Category Name before updating.",
      });
      return;
    }

    try {
      const updatecatId = editCategory.category_id;

      if (isStudentMeal(editCategory.name)) {
        if (editCategory.time_from >= editCategory.time_to) {
          swal({
            icon: "error",
            title: "Invalid Time",
            text: "Time from should be earlier than Time To",
          });
          return;
        }
        const response = await axios.put(
          BASE_URL + `/category/updateTimeCategory/${editCategory.category_id}`,
          {
            category_image: editCategory.category_image,
            time_from: editCategory.time_from,
            time_to: editCategory.time_to,
            userId,
          }
        );

        if (response.status === 200) {
          swal({
            title: "Student Meal Category Update Successful!",
            text: "The Category Information has been Updated Successfully.",
            icon: "success",
            button: "OK",
          }).then(() => {
            handleShowEditCategoryModal();
            reloadTable();
            setValidated(false);
          });
        }
      } else {
        setLoadingBtn(true);
        setProcessLabel("Updating");
        const response = await axios.put(
          BASE_URL + `/category/updateCategory/${editCategory.category_id}`,
          {
            name: editCategory.name,
            category_image: editCategory.category_image,
            userId,
          }
        );

        if (response.status === 200) {
          swal({
            title: "Category Update Successful!",
            text: "The Category Information has been Updated Successfully.",
            icon: "success",
            button: "OK",
          }).then(() => {
            handleShowEditCategoryModal();
            reloadTable();
            setValidated(false);
            setLoadingBtn(false);
            setProcessLabel("");
          });
        } else if (response.status === 202) {
          swal({
            icon: "error",
            title: "Category already exists",
            text: "Please input another Warehouse",
          });
          setLoadingBtn(false);
          setProcessLabel("");
        } else {
          swal({
            icon: "error",
            title: "Something went wrong",
            text: "Please contact our support",
          });
          setLoadingBtn(false);
          setProcessLabel("");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  // const handleEditProducts = (productId) => {
  //   setShowEditProduct(true);
  //   setShowAddProduct(false);
  //   const Idproduct = productId;
  //   axios
  //     .get(BASE_URL + "/product/fetchupdateProduct", {
  //       params: {
  //         Idproduct,
  //       },
  //     })
  //     .then((res) => {
  //       setthirdColprodId(res.data[0].product.product_id);
  //       setProductprice(res.data[0].product.price);
  //       setProductName(res.data[0].product.name);
  //       setproductSKU(res.data[0].product.sku);
  //       setProductspecificImage(res.data[0].product.image);
  //       const retrievedUnitValue = res.data[0].product.unit;
  //       const retrievedUnitLabel = productUnits.find(
  //         (unit) => unit.value === retrievedUnitValue
  //       ).label;
  //       setProductUnit(retrievedUnitValue);
  //       const data = res.data;
  //       const selectedCategory = data.map((row) => ({
  //         value: row.category_id,
  //         label: row.category.name,
  //       }));
  //       setProductCategorySpecific(selectedCategory);
  //     })
  //     .catch((err) => console.log(err));
  // };

  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEditProducts = (categoryId, productId) => {
    if (authrztn?.includes("Product-Edit")) {
      if (selectedProduct && categorySelected !== null) {
        const previousElement = document.getElementById(
          `product-list-container-${categorySelected}-${selectedProduct}`
        );
        if (previousElement) {
          previousElement.classList.remove("product-list-container-selected");
        }
      }
      // Add the selected class to the newly selected category
      const newElement = document.getElementById(
        `product-list-container-${categoryId}-${productId}`
      );
      if (newElement) {
        newElement.classList.add("product-list-container-selected");
      }

      setSelectedProduct(productId);
      setCategorySelected(categoryId);

      if(windowWidth > 992) {
        setShowEditProduct(true);
        setShowAddProduct(false);
      } else {
        setShowEditProductModal(true);
      }

      const category = Category.find((cat) => cat.category_id === categoryId);
      const hasStudentMeal = category && category.name.includes("Student Meal");
      setCategStudentMeal(hasStudentMeal);

      axios
        .get(BASE_URL + "/product/fetchupdateProduct", {
          params: {
            Idproduct: productId,
          },
        })
        .then((res) => {
          const productData = res.data[0].product;
          setthirdColprodId(productData.product_id);
          setProductprice(productData.price);
          setProductName(productData.name);
          setproductSKU(productData.sku);
          setProductspecificImage(productData.image);
          setProductThreshold(productData.threshold);
          setPrintable(productData.printable);
          // const retrievedUnitValue = productData.unit;
          // const retrievedUnitLabel = productUnits.find(
          //   (unit) => unit.value === retrievedUnitValue
          // )?.label;

          // setProductUnit(retrievedUnitValue);

          return axios.get(BASE_URL + "/product/fetchSpecificProductCategory", {
            params: {
              Idproduct: productId,
            },
          });
        })
        .then((res) => {
          const data = res.data;
          const selectedCategory = data.map((row) => ({
            value: row.category_id,
            label: row.category.name,
          }));
          setProductCategorySpecific(selectedCategory);
        })
        .catch((err) => console.log(err));
    }
  };

  useEffect(() => {
    console.log(Category);
  }, [Category]);

  const handleMultiUpdateCategory = (e) => {
    const selectedValues = e.value.map((value) => ({ value, label: "" }));

    if (selectedValues.length > 0) {
      setProductCategorySpecific(selectedValues);
      setIsSaveButtonDisabled(false); // Enable save button if at least one value is selected
    } else {
      swal({
        title: "Select atleast one category!",
        text: "Please select a category.",
        icon: "warning",
        button: "OK",
      });
    }
  };
  const handleSKU = (event) => {
    setproductSKU(event.target.value);
    setIsSaveButtonDisabled(false);
  };

  const handleProductName = (event) => {
    setProductName(event.target.value);
    setIsSaveButtonDisabled(false);
  };

  const handleProductPrice = (event) => {
    setProductprice(event.target.value);
    setIsSaveButtonDisabled(false);
  };

  // const handleProductUnit = (event) => {
  //   setProductUnit(event.target.value);
  //   setIsSaveButtonDisabled(false);
  // };

  const handleProducThreshold = (event) => {
    setProductThreshold(event.target.value);
    setIsSaveButtonDisabled(false);
  };
  const handlePrintableChange = (e) => {
    setPrintable(e.target.checked);
    setIsSaveButtonDisabled(false);
  };

  const handleDeleteCategory = async () => {
    swal({
      title: "Confirm Deletion",
      text: "Are you sure you want to delete?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          setLoadingBtn(true);
          setProcessLabel("Deleting");
          const response = await axios.delete(
            BASE_URL + `/category/delete/${categId}?userId=${userId}`
          );
          if (response.status === 200) {
            swal({
              title: "Category Deleted Successfully!",
              text: "The category has been successfully deleted.",
              icon: "success",
              button: "OK",
            }).then(() => {
              reloadTable();
              handleCloseEditCategoryModal();
              setLoadingBtn(false);
              setProcessLabel("");
            });
          } else if (response.status === 202) {
            swal({
              icon: "error",
              title: "Deletion Prohibited",
              text: "You cannot delete a category that is in used.",
            });
            setLoadingBtn(false);
            setProcessLabel("");
          } else {
            swal({
              icon: "error",
              title: "Something went wrong",
              text: "Please contact our support team for assistance.",
            });
            setLoadingBtn(false);
            setProcessLabel("");
          }
        } catch (err) {
          console.log(err);
        }
      }
    });
  };

  useEffect(() => {
    axios
      .get(BASE_URL + "/category/getCategory")
      .then((res) => setFetchCategory(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleCallFetchCategory = () => {
    axios
      .get(BASE_URL + "/category/getCategory")
      .then((res) => setFetchCategory(res.data))
      .catch((err) => console.log(err));
  };
  const [updateFormData, setUpdateFormData] = useState({
    categoryId: "",
    name: "",
    sku: "",
  });

  //--------------------------------Product Category list fetch---------------------------------//

  //--------------------------------End Product Category list fetch---------------------------------//

  //--------------------------------Add Product Category---------------------------------//
  const [name, setName] = useState();
  const [categoryImages, setCategoryimages] = useState("");

  const fileInputRefs = useRef(null);

  function selectImageFiles() {
    fileInputRefs.current.click();
  }

  const onFileSelects = (event) => {
    const selectedImages = event.target.files[0]; // Assuming only one file is selected
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB LIMIT

    if (
      selectedImages &&
      allowedTypes.includes(selectedImages.type) &&
      selectedImages.size <= maxSize
    ) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImages);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        setCategoryimages(base64String);
      };
    } else {
      swal({
        icon: "error",
        title: "File Selection Error",
        text: "Please select a valid image file (PNG, JPEG, JPG, or WEBP) with a maximum size of 5MB.",
      });
    }
  };

  const deletecategoryImage = () => {
    setCategoryimages("");
  };

  const createCategory = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();

      if (categoryImages == "") {
        swal({
          icon: "error",
          title: "Image is required for the category",
          text: "Please put an image for the category",
        });
      } else {
        swal({
          icon: "error",
          title: "Fields are required",
          text: "Please fill the red text fields",
        });
      }
    } else {
      setLoadingBtn(true);
      axios
        .post(`${BASE_URL}/category/create`, {
          name: name,
          categoryImages,
          userId,
        })
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            SuccessInserted(res);
            handleCloseCategoryModal();
            setCategoryimages("");
            setLoadingBtn(false);
            handleCallFetchCategory();
            reloadTable();
            setValidated(false);
          } else if (res.status === 201) {
            Duplicate_Message();
          } else {
            ErrorInserted();
          }
        });
    }
    setValidated(true); //for validations
  };
  //--------------------------------End Product Category---------------------------------//
  //--------------------------------Valdidations---------------------------------//
  const SuccessInserted = (res) => {
    swal({
      title: "Created New Product Category",
      text: "The Product Category has been added successfully",
      icon: "success",
      button: "OK",
    }).then(() => {
      const newId = res.data.category_id;
      // console.log(newId)
      setCategory((prev) => [
        ...prev,
        {
          category_id: newId,
          name: res.data.name,
          createdAt: res.data.createdAt,
          updatedAt: res.data.updatedAt,
        },
      ]);
      setName("");
      setShow(false);
      reloadTable();
    });
  };
  const Duplicate_Message = () => {
    swal({
      title: "Product Category Name Already Exist",
      text: "Try other Product Category name",
      icon: "error",
      button: "OK",
    });

    setLoadingBtn(false);
  };

  const ErrorInserted = () => {
    swal({
      title: "Something went wrong",
      text: "Please Contact our Support",
      icon: "error",
      button: "OK",
    });

    setLoadingBtn(false);
  };

  //for adding product image
  const [productImages, setproductImages] = useState("");
  const fileInputRef = useRef(null);

  function selectFiles() {
    fileInputRef.current.click();
  }

  const onFileSelect = (event) => {
    const selectedFile = event.target.files[0]; // Assuming only one file is selected
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB LIMIT

    if (
      selectedFile &&
      allowedTypes.includes(selectedFile.type) &&
      selectedFile.size <= maxSize
    ) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        setproductImages(base64String);
      };
    } else {
      swal({
        icon: "error",
        title: "File Selection Error",
        text: "Please select a valid image file (PNG, JPEG, JPG, or WEBP) with a maximum size of 5MB.",
      });
    }
  };

  const deleteImage = () => {
    setproductImages("");
  };

  //updating product image
  const fileSpecificInputRef = useRef(null);

  function selectspecificFiles() {
    fileSpecificInputRef.current.click();
    setIsSaveButtonDisabled(false);
  }

  const onFilespecificSelect = (event) => {
    const selectedSpecificFile = event.target.files[0]; // Assuming only one file is selected
    const allowedspecificTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    const maxSpecificSize = 5 * 1024 * 1024; // 5MB LIMIT
    setIsSaveButtonDisabled(false);

    if (
      selectedSpecificFile &&
      allowedspecificTypes.includes(selectedSpecificFile.type) &&
      selectedSpecificFile.size <= maxSpecificSize
    ) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedSpecificFile);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        setProductspecificImage(base64String);
      };
    } else {
      swal({
        icon: "error",
        title: "File Selection Error",
        text: "Please select a valid image file (PNG, JPEG, JPG, or WEBP) with a maximum size of 5MB.",
      });
    }
  };

  const deleteSpecificImage = () => {
    setProductspecificImage("");
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (
      form.checkValidity() === false ||
      (!productspecificImage && fileSpecificInputRef.current.files.length === 0)
    ) {
      e.preventDefault();
      e.stopPropagation();
      if (productspecificImage == "") {
        swal({
          icon: "error",
          title: "Image is required for the category",
          text: "Please put an image for the category",
        });
      } else {
        swal({
          icon: "error",
          title: "Fields are required",
          text: "Please fill the red text fields",
        });
      }
    } else {
      setLoadingBtn(true);
      axios
        .post(`${BASE_URL}/product/updateProduct`, {
          thirdColprodId,
          productprice,
          productName,
          productSKU,
          productspecificImage,
          // productUnit,
          productCategorySpecific,
          productThreshold,
          userId,
          printable,
        })
        .then((res) => {
          // console.log(res);
          if (res.status === 200) {
            swal({
              title: "Product Update Successful!",
              text: "The product information has been updated successfully.",
              icon: "success",
              button: "OK",
            }).then(() => {
              setIsSaveButtonDisabled(true);
              setValidated(false);
              setShowEditProduct(false);
              setLoadingBtn(false);
              setShowEditProductModal(false);
            });
          } else if (res.status === 201) {
            swal({
              icon: "error",
              title: "Product Already Exists",
              text: "Please input a new product",
            });
            setLoadingBtn(false);
          } else {
            swal({
              icon: "error",
              title: "Something went wrong",
              text: "Please contact our support",
            });
            setLoadingBtn(false);
          }
        });
    }
    setValidated(true); //for validations
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (categorydata.length === 0) {
      setCategoryValid(false);
      swal({
        icon: "error",
        title: "Fields are required",
        text: "Please select at least one category",
      });
      return;
    } else {
      setCategoryValid(true);
    }

    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      if (productImages == "") {
        swal({
          icon: "error",
          title: "Image is required for the category",
          text: "Please put an image for the category",
        });
      } else {
        swal({
          icon: "error",
          title: "Fields are required",
          text: "Please fill the red text fields",
        });
      }
    } else {
      setLoadingBtn(true);
      try {
        const res = await axios.post(`${BASE_URL}/product/create`, {
          categorydata,
          sku,
          productnames,
          price,
          productImages,
          // unit,
          Threshold,
          userId,
          printable,
        });
        if (res.status === 200) {
          swal({
            title: "Product Added Successfully!",
            text: "The new product has been added successfully.",
            icon: "success",
            button: "OK",
          }).then(() => {
            setCategoryData([]);
            setSku("");
            setproductNames("");
            setPrice("");
            setproductImages("");
            // setUnit("");
            setThreshold("");
            setValidated(false);
            handleCategoryClick(categorySelected);
            setPrintable(false);
            setLoadingBtn(false);
            setShowAddProductModal(false);
          });
        } else if (res.status === 201) {
          swal({
            title: "Product is Already Exists",
            text: "Please enter a new product ",
            icon: "error",
          });
          setLoadingBtn(false);
        } else {
          swal({
            icon: "error",
            title: "Something went wrong",
            text: "Please contact our support",
          });
          setLoadingBtn(false);
        }
      } catch (error) {
        console.error(error);
        ErrorInserted();
      }
    }
    setValidated(true);
  };

  const handleShowArchive = () => {
    setShowArchiveModal(true);
  };

  const handleArchiveProduct = async () => {
    try {
      setShowEditProduct(false);
      setLoadingBtn(true);
      const res = await axios.put(`${BASE_URL}/product/archive`, {
        thirdColprodId,
        remarks,
        userId,
      });
      if (res.status == 200) {
        // Update Products state to filter out the archived product
        setProduct((prevProducts) =>
          prevProducts.filter(
            (product) => product.product.product_id !== thirdColprodId
          )
        );

        swal({
          icon: "success",
          title: "Success",
          text: "Product successfully archived",
        }).then(() => {
          handleCloseArchiveModal();
          setLoadingBtn(false);
        });
      }
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  //--------------------------------End of Validations---------------------------------//
  //--------------------------------Reload Table---------------------------------//
  const reloadTable = () => {
    axios
      .get(BASE_URL + "/category/getCategory")
      .then((res) => {
        setCategory(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(true);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      reloadTable();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [mealPrice, setMealPrice] = useState();

  //--------------------------------End Reload Table---------------------------------//

  const [categorySelected, setCategorySelected] = useState("");
  const handleCategoryClick = (categoryId) => {
    const previousElement = document.getElementById(
      `category-list-container-${categorySelected}`
    );
    if (previousElement) {
      previousElement.classList.remove("category-list-container-selected");
    }

    // Add the selected class to the newly selected category
    const newElement = document.getElementById(
      `category-list-container-${categoryId}`
    );
    if (newElement) {
      newElement.classList.add("category-list-container-selected");
    }
    const Idcategory = categoryId;
    setCategorySelected(Idcategory);
    setCategoryData([]); //reset when reclick
    setCategoryData((prevData) => [...prevData, Idcategory]);
    setShowEditProduct(false);

    const category = Category.find((cat) => cat.category_id === categoryId);
    const hasStudentMeal = category && category.name.includes("Student Meal");
    setPrice(hasStudentMeal ? mealPrice : "");
    setCategStudentMeal(hasStudentMeal);

    axios
      .get(BASE_URL + "/category_product/fetchSpecificCategory", {
        params: {
          Idcategory,
        },
      })
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => console.log(err));
  };

  //--------------------------------Add new Product---------------------------------//
  const [updateProductFormData, setUpdateProductFormData] = useState({
    productName: "",
    price: "",
    sku: "",
  });

  //--------------------------------End Add new Product-----------------------------//

  const [categStudentMeal, setCategStudentMeal] = useState(false);

  const handleCategoryChange = (e) => {
    const selectedCategories = e.value;
    setCategoryData(selectedCategories);
    const hasStudentMeal = selectedCategories.some((category_id) => {
      const category = Category.find((cat) => cat.category_id === category_id);
      return category && category.name.includes("Student Meal");
    });
    setCategStudentMeal(hasStudentMeal);
    setPrice(hasStudentMeal ? mealPrice : "");
  };

  const handleFetchProfile = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);

    setMealPrice(res.data.store_student_meal_price);
  };

  useEffect(() => {
    handleFetchProfile();
  }, []);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Function to update the window width state
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  // Set up event listener for window resize
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="d-flex justify-content-center flex-column vh-100 ms-5 ps-5 align-items-center">
          <FourSquare
            color="#6290FE"
            size="large"
            text="Loading Data..."
            textColor=""
          />
        </div>
      ) : authrztn.includes("Product-View") ? (
        <div
          className="product-container"
          style={showAddProduct ? {} : { height: "100vh" }}
        >
          {/* Category Container */}
          <div className="category-container">
            <div className="title-container align-items-center">
              <h4>Category</h4>
              <div
                className="add-container mx-2"
                style={{
                  width: windowWidth > 576 && "40%" || windowWidth > 768 ? "40%" : "25%",
                  textAlign: windowWidth > 425 && "center",
                }}
              >
                {authrztn?.includes("Product-Add") && (
                  <button
                    className="btn btn-outline-primary"
                    style={{ width: windowWidth > 576 ? "80px" : "40px" }}
                    onClick={handleShowCategoryModal}
                  >
                    Add
                  </button>
                )}
              </div>
            </div>

            <div className="prod-list-cont" style={{ paddingTop: "6rem" }}>
              {Category.length === 0 ? (
                <div className="category-list-container d-flex justify-content-center">
                  <div className="no-data-container">
                    <img src={noData} />
                    <h2>No Data</h2>
                  </div>
                </div>
              ) : (
                Category.map((category) => (
                  <>
                    <div
                      id={`category-list-container-${category.category_id}`}
                      className="category-list-container"
                      key={category.name}
                      onClick={() => {
                        handleCategoryClick(category.category_id);
                      }}
                    >
                      <div className="category-list">
                        <h3>{category.name}</h3>
                        {authrztn?.includes("Product-Edit") && (
                          <HiMiniPencilSquare
                            onClick={() =>
                              handleShowEditCategoryModal(category)
                            }
                            className="pencil"
                          />
                        )}
                      </div>
                    </div>
                  </>
                ))
              )}
            </div>
          </div>
          {/* End of Category Container */}

          {/* Products container */}
          <div className="products-container">
            <div className="product-title-container flex-column flex-lg-row align-items-start align-items-md-center pb-lg-0">
              <div className="d-flex justify-content-between align-items-center" style={{ width: windowWidth < 992 && "100%"}}>
                <h4 className="">Products</h4>
                <div
                  className="mx-2 d-inline-block d-lg-none"
                  style={{
                    width: windowWidth > 768 ? "25%" : "40%",
                    textAlign: windowWidth > 425 && "center",
                  }}
                >
                  {authrztn?.includes("Product-Add") && (
                    <button
                      className="btn btn-outline-primary"
                      style={{ width: windowWidth > 576 ? "80px" : "40px" }}
                      onClick={() => {
                        if (windowWidth > 992) {
                          setShowAddProduct(true);
                          setShowEditProduct(false);
                        } else {
                          setShowAddProductModal(true);
                        }
                      }}
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
              <div
                className="d-flex justify-content-center align-items-center py-0"
                style={{ width: "100%" }}
              >
                <div className="product-search w-100 ">
                  {/* Input element with centered styling */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search products"
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      padding: "1rem",
                      width: windowWidth > 992 ? "80%" : "93%",
                      margin: windowWidth > 992 ? "0 auto" : "0 0 0 2rem",
                      display: "block",
                      fontSize: "1.3rem",
                    }}
                  />
                </div>
                <div
                  className="add-container mx-2 d-none d-lg-block"
                  style={{
                    width: windowWidth > 768 ? "25%" : "50%",
                    textAlign: windowWidth > 425 && "center",
                  }}
                >
                  {authrztn?.includes("Product-Add") && (
                    <button
                      className="btn btn-outline-primary"
                      style={{ width: windowWidth > 576 ? "80px" : "40px" }}
                      onClick={() => {
                        if (windowWidth > 992) {
                          setShowAddProduct(true);
                          setShowEditProduct(false);
                        } else {
                          setShowAddProductModal(true);
                        }
                      }}
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div
              className="prod-list-cont"
              style={{ paddingTop: windowWidth > 992 ? "7rem" : "13rem" }}
            >
              {filteredProducts.length === 0 ? (
                <div className="no-product-data-container d-grid justify-content-center">
                  <div>
                    <img src={noData} alt="No Data" className="cat-no-data" />
                    <h2>No Products Found</h2>
                  </div>
                </div>
              ) : (
                filteredProducts.map((data, index) => (
                  <div
                    id={`product-list-container-${data.category.category_id}-${data.product.product_id}`}
                    className="product-list-container"
                    key={`${data.category.category_id}-${data.product.product_id}`}
                    onClick={() =>
                      handleEditProducts(
                        data.category.category_id,
                        data.product.product_id
                      )
                    }
                  >
                    <div className="product-list">
                      <div className="product-details-container">
                        {data.product.image ? (
                          <img
                            src={`data:image/png;base64,${data.product.image}`}
                            alt="Product"
                          />
                        ) : (
                          <img src={Noimg} alt="No image" />
                        )}
                        <div className="product-details">
                          <h2>{data.product.name}</h2>

                          <span>{data.category.name}</span>
                        </div>
                      </div>
                      <div className="product-price">
                        ₱
                        {data.product.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* End of Products container */}

          {/* Add Product Modal */}
          <Modal show={showAddProductModal}>
            <Modal.Header>
              <Modal.Title>
                <div>
                  <h1 className="ms-3">Add Product</h1>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={addProduct}>
              <Modal.Body>
                <div className="add-input-container">
                  {/* Category */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Category:
                    </p>
                    <MultiSelect
                      appendTo="self"
                      value={categorydata}
                      options={Category.map((category) => ({
                        value: category.category_id,
                        label: category.name,
                      }))}
                      autoFocus={false}
                      // onChange={(e) => setCategoryData(e.value)}
                      onChange={handleCategoryChange}
                      placeholder="Select Category"
                      maxSelectedLabels={3}
                      className="w-full md:w-20rem"
                      filter
                      required
                    />
                    {/* <div>{JSON.stringify(Category)}</div>s */}
                  </div>

                  {/* SKU */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> SKU:
                    </p>

                    <div class="input-group mb-3">
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        class="form-control m-0"
                        aria-label="Sizing example input"
                        aria-describedby="inputGroup-sizing-default"
                        required
                      />
                    </div>
                  </div>
                  {/* Name */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Name:
                    </p>

                    <div class="input-group mb-3">
                      <Form.Control
                        value={productnames}
                        type="text"
                        className="m-0"
                        placeholder=""
                        required
                        style={{ height: "40px", fontSize: "15px" }}
                        onChange={(e) => setproductNames(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Price */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Price:
                    </p>

                    <div class="input-group mb-3">
                      <input
                        value={price}
                        type="number"
                        onChange={(e) => setPrice(e.target.value)}
                        className="form-control m-0"
                        aria-label="Sizing example input"
                        aria-describedby="inputGroup-sizing-default"
                        required
                        readOnly={categStudentMeal}
                      />
                    </div>
                  </div>
                  {/* <div className="product-input-container">
                  <p>
                    <span>*</span> Unit:
                  </p>

                  <select
                    className="form-select"
                    aria-label="Default select example"
                    required
                    onChange={(e) => setUnit(e.target.value)}
                    value={unit}
                  >
                    <option disabled value="">
                      Select Unit
                    </option>
                    {productUnits.map((unit, index) => (
                      <option key={index} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div> */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Threshold:
                    </p>
                    <input
                      value={Threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      className="form-control m-0"
                      aria-label="Sizing example input"
                      aria-describedby="inputGroup-sizing-default"
                      required
                      type="number"
                    />
                  </div>

                  <div
                    className="d-flex flex-row p-0"
                    style={{ marginLeft: "12px" }}
                  >
                    <div>
                      <p>Printable Kitchen:</p>
                    </div>
                    <div style={{ padding: "4px", marginLeft: "10px" }}>
                      <input
                        type="checkbox"
                        checked={printable}
                        onChange={(e) => setPrintable(e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <div className="product-upload-container">
                  <p>
                    <span style={{ color: "red" }}>*</span>Upload Product Image:
                  </p>
                  <div className="product-image-main-container">
                    <div className="productimageIcon">
                      {productImages.length === 0 ? (
                        <div className="icon-image-display">
                          <Image size={52} color="#a1a1a1" />
                        </div>
                      ) : (
                        <div className="icon-image-display">
                          <span
                            className="deleteproductimage"
                            onClick={deleteImage}
                          >
                            &times;
                          </span>
                          <img src={`data:image/png;base64,${productImages}`} />
                        </div>
                      )}
                    </div>

                    <div className="productFileinputs">
                      <div className="uploading-product-image-section">
                        <span
                          className="select"
                          role="button"
                          onClick={selectFiles}
                        >
                          Upload
                        </span>
                        <input
                          name="file"
                          type="file"
                          className="file"
                          ref={fileInputRef}
                          onChange={(e) => onFileSelect(e)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <div className="save-btn-container w-100">
                  {!loadingBtn ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleCancelAddProduct}
                      >
                        Cancel
                      </button>
                      <button type="Submit" className="btn btn-primary">
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="d-flex w-100 justify-content-end p-0">
                        <ReactLoading
                          color="blue"
                          type={"spinningBubbles"}
                          height={"10%"}
                          width={"10%"}
                        />
                        <span
                          style={{
                            fontSize: "2rem",
                            // marginTop: "10px",
                            marginLeft: "5px",
                          }}
                        >
                          Saving. . .
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Add Product Container */}
          {showAddProduct && !showEditProduct ? (
            <div className="add-product-container d-none d-lg-block">
              <div className="title-container">
                <h4 className="ms-3">Add Product</h4>
              </div>
              <hr />
              <Form noValidate validated={validated} onSubmit={addProduct}>
                <div className="add-input-container">
                  {/* Category */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Category:
                    </p>
                    <MultiSelect
                      value={categorydata}
                      options={Category.map((category) => ({
                        value: category.category_id,
                        label: category.name,
                      }))}
                      // onChange={(e) => setCategoryData(e.value)}
                      onChange={handleCategoryChange}
                      placeholder="Select Category"
                      maxSelectedLabels={3}
                      className="w-full md:w-20rem"
                      filter
                      required
                    />
                  </div>
                  {/* SKU */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> SKU:
                    </p>

                    <div class="input-group mb-3">
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        class="form-control m-0"
                        aria-label="Sizing example input"
                        aria-describedby="inputGroup-sizing-default"
                        required
                      />
                    </div>
                  </div>
                  {/* Name */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Name:
                    </p>

                    <div class="input-group mb-3">
                      <Form.Control
                        value={productnames}
                        type="text"
                        className="m-0"
                        placeholder=""
                        required
                        style={{ height: "40px", fontSize: "15px" }}
                        onChange={(e) => setproductNames(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Price */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Price:
                    </p>

                    <div class="input-group mb-3">
                      <input
                        value={price}
                        type="number"
                        onChange={(e) => setPrice(e.target.value)}
                        className="form-control m-0"
                        aria-label="Sizing example input"
                        aria-describedby="inputGroup-sizing-default"
                        required
                        readOnly={categStudentMeal}
                      />
                    </div>
                  </div>
                  {/* <div className="product-input-container">
                  <p>
                    <span>*</span> Unit:
                  </p>

                  <select
                    className="form-select"
                    aria-label="Default select example"
                    required
                    onChange={(e) => setUnit(e.target.value)}
                    value={unit}
                  >
                    <option disabled value="">
                      Select Unit
                    </option>
                    {productUnits.map((unit, index) => (
                      <option key={index} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div> */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Threshold:
                    </p>
                    <input
                      value={Threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      class="form-control m-0"
                      aria-label="Sizing example input"
                      aria-describedby="inputGroup-sizing-default"
                      required
                      type="number"
                    />
                  </div>

                  <div
                    className="d-flex flex-row p-0"
                    style={{ marginLeft: "12px" }}
                  >
                    <div>
                      <p>Printable Kitchen:</p>
                    </div>
                    <div style={{ padding: "4px", marginLeft: "10px" }}>
                      <input
                        type="checkbox"
                        checked={printable}
                        onChange={(e) => setPrintable(e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <div className="product-upload-container">
                  <p>
                    <span style={{ color: "red" }}>*</span>Upload Product Image:
                  </p>
                  <div className="product-image-main-container">
                    <div className="productimageIcon">
                      {productImages.length === 0 ? (
                        <div className="icon-image-display">
                          <Image size={52} color="#a1a1a1" />
                        </div>
                      ) : (
                        <div className="icon-image-display">
                          <span
                            className="deleteproductimage"
                            onClick={deleteImage}
                          >
                            &times;
                          </span>
                          <img src={`data:image/png;base64,${productImages}`} />
                        </div>
                      )}
                    </div>

                    <div className="productFileinputs">
                      <div className="uploading-product-image-section">
                        <span
                          className="select"
                          role="button"
                          onClick={selectFiles}
                        >
                          Upload
                        </span>
                        <input
                          name="file"
                          type="file"
                          className="file"
                          ref={fileInputRef}
                          onChange={(e) => onFileSelect(e)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="save-btn-container">
                  {!loadingBtn ? (
                    <>
                      <button
                        className="btn btn-outline-primary"
                        onClick={handleCancelAddProduct}
                      >
                        Cancel
                      </button>
                      <button type="Submit" className="btn btn-primary">
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="d-flex w-100 justify-content-end p-0">
                        <ReactLoading
                          color="blue"
                          type={"spinningBubbles"}
                          height={"10%"}
                          width={"10%"}
                        />
                        <span
                          style={{
                            fontSize: "2rem",
                            // marginTop: "10px",
                            marginLeft: "5px",
                          }}
                        >
                          Saving. . .
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Form>
            </div>
          ) : null}

          {/* Edit Product Modal */}
          <Modal show={showEditProductModal}>
            <Modal.Header>
              <Modal.Title className="w-100">
                <div className="title-container d-flex justify-content-between align-items-center w-100 pb-1">
                  <h1
                    className="ms-2 p-0 mb-0"
                    style={{ flex: 1 }}
                  >
                    Edit Product
                  </h1>
                  {authrztn.includes("Product-Delete") && (
                    <div
                      className="d-flex align-items-center archive-btn"
                      onClick={() => handleShowArchive(thirdColprodId)}
                    >
                      <h3>Archive</h3>
                    </div>
                  )}
                </div>
              </Modal.Title>
            </Modal.Header>
            <Form
              noValidate
              validated={validated}
              onSubmit={handleUpdateProduct}
            >
              <Modal.Body>
                <div className="add-input-container">
                  {/* Category */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Category:
                    </p>
                    <MultiSelect
                      appendTo="self"
                      value={productCategorySpecific.map((item) => item.value)}
                      options={fetchCategory.map((category) => ({
                        value: category.category_id,
                        label: category.name,
                      }))}
                      onChange={handleMultiUpdateCategory}
                      placeholder="Select Category"
                      maxSelectedLabels={3}
                      className="w-full md:w-20rem"
                      filter
                      required
                    />
                  </div>
                  {/* SKU */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> SKU:
                    </p>

                    <div class="input-group mb-3">
                      <input
                        type="text"
                        class="form-control m-0"
                        aria-label="Sizing example input"
                        aria-describedby="inputGroup-sizing-default"
                        required
                        value={productSKU}
                        onChange={(e) => handleSKU(e)}
                      />
                    </div>
                  </div>
                  {/* Name */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Name:
                    </p>

                    <div class="input-group mb-3">
                      <input
                        type="text"
                        class="form-control m-0"
                        aria-label="Sizing example input"
                        aria-describedby="inputGroup-sizing-default"
                        required
                        value={productName}
                        onChange={(e) => handleProductName(e)}
                      />
                    </div>
                  </div>
                  {/* Price */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Price:
                    </p>

                    <div class="input-group mb-3">
                      <input
                        type="number"
                        class="form-control m-0"
                        aria-label="Sizing example input"
                        aria-describedby="inputGroup-sizing-default"
                        required
                        value={productprice}
                        onChange={(e) => handleProductPrice(e)}
                        readOnly={categStudentMeal}
                      />
                    </div>
                  </div>

                  <div className="product-input-container">
                    <p>
                      <span>*</span> Threshold:
                    </p>
                    <input
                      type="number"
                      class="form-control m-0"
                      aria-label="Sizing example input"
                      aria-describedby="inputGroup-sizing-default"
                      required
                      value={productThreshold}
                      onChange={(e) => handleProducThreshold(e)}
                    />
                  </div>
                  <div
                    className="d-flex flex-row p-0"
                    style={{ marginLeft: "12px" }}
                  >
                    <div>
                      <p>Printable Kitchen:</p>
                    </div>
                    <div style={{ padding: "4px", marginLeft: "10px" }}>
                      <input
                        type="checkbox"
                        value={printable}
                        checked={printable}
                        onChange={handlePrintableChange}
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <div className="product-upload-container">
                  <p>
                    <span style={{ color: "red" }}>*</span>Upload Product Image:
                  </p>
                  <div className="product-image-main-container">
                    <div className="productimageIcon">
                      {productspecificImage.length === 0 ? (
                        <div className="icon-image-display">
                          <Image size={52} color="#a1a1a1" />
                        </div>
                      ) : (
                        <div className="icon-image-display">
                          <span
                            className="deleteproductimage"
                            onClick={deleteSpecificImage}
                          >
                            &times;
                          </span>
                          <img
                            src={`data:image/png;base64,${productspecificImage}`}
                          />
                        </div>
                      )}
                    </div>

                    <div className="productFileinputs">
                      <div className="uploading-product-image-section">
                        <span
                          className="select"
                          role="button"
                          onClick={selectspecificFiles}
                        >
                          Upload
                        </span>
                        <input
                          name="file"
                          type="file"
                          className="file"
                          ref={fileSpecificInputRef}
                          onChange={(e) => onFilespecificSelect(e)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <div className="save-btn-container w-100">
                  {!loadingBtn ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => {
                          setShowEditProduct(false);
                          setShowEditProductModal(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaveButtonDisabled}
                      >
                        Update
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="d-flex w-100 justify-content-end p-0">
                        <ReactLoading
                          color="blue"
                          type={"spinningBubbles"}
                          height={"10%"}
                          width={"10%"}
                        />
                        <span
                          style={{
                            fontSize: "2rem",
                            // marginTop: "10px",
                            marginLeft: "5px",
                          }}
                        >
                          Updating. . .
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Modal.Footer>
            </Form>
          </Modal>

          {showEditProduct && !showAddProduct ? (
            <div className="add-product-container d-none d-lg-block">
              <div className="title-container d-flex pb-1">
                <h4
                  className="ms-2 d-flex align-items-center p-0 mb-0 "
                  style={{ flex: 1 }}
                >
                  Edit Product
                </h4>
                {authrztn.includes("Product-Delete") && (
                  <div
                    className="d-flex align-items-center archive-btn "
                    onClick={() => handleShowArchive(thirdColprodId)}
                  >
                    <h3>Archive</h3>
                  </div>
                )}
              </div>
              <hr />

              <Form
                noValidate
                validated={validated}
                onSubmit={handleUpdateProduct}
              >
                <div className="add-input-container">
                  {/* Category */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Category:
                    </p>
                    <MultiSelect
                      value={productCategorySpecific.map((item) => item.value)}
                      options={fetchCategory.map((category) => ({
                        value: category.category_id,
                        label: category.name,
                      }))}
                      onChange={handleMultiUpdateCategory}
                      placeholder="Select Category"
                      maxSelectedLabels={3}
                      className="w-full md:w-20rem"
                      filter
                      required
                    />
                  </div>
                  {/* SKU */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> SKU:
                    </p>

                    <div class="input-group mb-3">
                      <input
                        type="text"
                        class="form-control m-0"
                        aria-label="Sizing example input"
                        aria-describedby="inputGroup-sizing-default"
                        required
                        value={productSKU}
                        onChange={(e) => handleSKU(e)}
                      />
                    </div>
                  </div>
                  {/* Name */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Name:
                    </p>

                    <div class="input-group mb-3">
                      <input
                        type="text"
                        class="form-control m-0"
                        aria-label="Sizing example input"
                        aria-describedby="inputGroup-sizing-default"
                        required
                        value={productName}
                        onChange={(e) => handleProductName(e)}
                      />
                    </div>
                  </div>
                  {/* Price */}
                  <div className="product-input-container">
                    <p>
                      <span>*</span> Price:
                    </p>

                    <div class="input-group mb-3">
                      <input
                        type="number"
                        class="form-control m-0"
                        aria-label="Sizing example input"
                        aria-describedby="inputGroup-sizing-default"
                        required
                        value={productprice}
                        onChange={(e) => handleProductPrice(e)}
                        readOnly={categStudentMeal}
                      />
                    </div>
                  </div>

                  <div className="product-input-container">
                    <p>
                      <span>*</span> Threshold:
                    </p>
                    <input
                      type="number"
                      class="form-control m-0"
                      aria-label="Sizing example input"
                      aria-describedby="inputGroup-sizing-default"
                      required
                      value={productThreshold}
                      onChange={(e) => handleProducThreshold(e)}
                    />
                  </div>
                  <div
                    className="d-flex flex-row p-0"
                    style={{ marginLeft: "12px" }}
                  >
                    <div>
                      <p>Printable Kitchen:</p>
                    </div>
                    <div style={{ padding: "4px", marginLeft: "10px" }}>
                      <input
                        type="checkbox"
                        value={printable}
                        checked={printable}
                        onChange={handlePrintableChange}
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <div className="product-upload-container">
                  <p>
                    <span style={{ color: "red" }}>*</span>Upload Product Image:
                  </p>
                  <div className="product-image-main-container">
                    <div className="productimageIcon">
                      {productspecificImage.length === 0 ? (
                        <div className="icon-image-display">
                          <Image size={52} color="#a1a1a1" />
                        </div>
                      ) : (
                        <div className="icon-image-display">
                          <span
                            className="deleteproductimage"
                            onClick={deleteSpecificImage}
                          >
                            &times;
                          </span>
                          <img
                            src={`data:image/png;base64,${productspecificImage}`}
                          />
                        </div>
                      )}
                    </div>

                    <div className="productFileinputs">
                      <div className="uploading-product-image-section">
                        <span
                          className="select"
                          role="button"
                          onClick={selectspecificFiles}
                        >
                          Upload
                        </span>
                        <input
                          name="file"
                          type="file"
                          className="file"
                          ref={fileSpecificInputRef}
                          onChange={(e) => onFilespecificSelect(e)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="save-btn-container">
                  {!loadingBtn ? (
                    <>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => setShowEditProduct(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaveButtonDisabled}
                      >
                        Update
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="d-flex w-100 justify-content-end p-0">
                        <ReactLoading
                          color="blue"
                          type={"spinningBubbles"}
                          height={"10%"}
                          width={"10%"}
                        />
                        <span
                          style={{
                            fontSize: "2rem",
                            // marginTop: "10px",
                            marginLeft: "5px",
                          }}
                        >
                          Updating. . .
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Form>
            </div>
          ) : null}

          {/* End of Update Product Container */}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
            marginTop: "10%",
          }}
        >
          <img src={NoAccess} alt="NoAccess" className="no-access-img" />
          <h3>You don't have access to this function.</h3>
        </div>
      )}
      {/* Modal for Add Category */}
      <Modal show={showAddCategoryModal} onHide={handleCloseCategoryModal}>
        <Form noValidate validated={validated} onSubmit={createCategory}>
          <Modal.Header>
            <Modal.Title>
              <h2>Add Category</h2>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-category upload d-flex align-items-center pb-1">
              <p className="mx-0 mb-0">
                <span className="text-danger">* </span>Upload Product Image:
              </p>
              <div className="modal-upload-btn">
                <div className="image-section">
                  {categoryImages.length === 0 ? (
                    <div className="imagedisplaying">
                      <Image size={42} color="#a1a1a1" />
                    </div>
                  ) : (
                    <div className="imagedisplaying">
                      <span
                        className="deleteimages"
                        onClick={deletecategoryImage}
                      >
                        &times;
                      </span>
                      <img src={`data:image/png;base64,${categoryImages}`} />
                    </div>
                  )}
                </div>

                <div className="uploading-section">
                  <div className="upload-sec-button">
                    <span
                      className="select"
                      role="button"
                      onClick={selectImageFiles}
                    >
                      Upload
                    </span>
                    <input
                      type="file"
                      className="file"
                      name="file"
                      ref={fileInputRefs}
                      onChange={onFileSelects}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-category d-flex align-items-center justify-content-center">
              <p className="mb-0">
                <span className="text-danger">* </span>Category Name:
              </p>
              <div class="input-group" style={{width: "60%"}}>
                <input
                  type="text"
                  className="form-control m-0"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {!loadingBtn ? (
              <>
                <Button
                  variant="outline-primary"
                  onClick={handleCloseCategoryModal}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save
                </Button>
              </>
            ) : (
              <>
                <div className="d-flex w-50 justify-content-end p-0">
                  <ReactLoading
                    color="blue"
                    type={"spinningBubbles"}
                    height={"10%"}
                    width={"10%"}
                  />
                  <span
                    style={{
                      fontSize: "2rem",
                      marginTop: "10px",
                      marginLeft: "5px",
                    }}
                  >
                    Saving. . .
                  </span>
                </div>
              </>
            )}
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal for Edit Category */}
      <Modal
        show={showEditCategoryModal}
        onHide={handleCloseEditCategoryModal}
        centered
      >
        <Form noValidate validated={validated} onSubmit={handleUpdateSubmit}>
          <Modal.Header>
            <Modal.Title>
              <h2>Update Category</h2>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-category upload d-flex align-items-center pb-1">
              <p className="mx-0 mb-0">Upload Product Image:</p>
              <div className="modal-upload-btn">
                <div className="image-section">
                  {editCategory.category_image &&
                  typeof editCategory.category_image === "string" &&
                  editCategory.category_image.length > 0 ? (
                    <div className="imagedisplaying">
                      <span
                        className="deleteimages"
                        onClick={handleDeleteImageCategory}
                      >
                        &times;
                      </span>
                      <img
                        src={`data:image/png;base64,${editCategory.category_image}`}
                        alt="Category"
                      />
                    </div>
                  ) : (
                    <div className="imagedisplaying">
                      <Image size={42} color="#a1a1a1" />
                    </div>
                  )}
                </div>

                <div className="uploading-section">
                  <div className="upload-sec-button">
                    <span
                      className="select"
                      role="button"
                      onClick={selectUpdateCategoryImage}
                    >
                      Upload
                    </span>
                    <input
                      type="file"
                      className="file"
                      name="file"
                      ref={fileUpdateInputRefs}
                      onChange={handleImageCategoryChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-category d-flex align-items-center justify-content-center">
              <p className="mb-0">Category Name:</p>
              <div class="input-group" style={{width: "60%"}}>
                <input
                  type="text"
                  className="form-control mb-0 ms-0"
                  placeholder="Soda"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                  value={editCategory.name}
                  name="name"
                  onChange={handleCategoryUpdate}
                  disabled={isStudentMeal(editCategory.name)}
                />
              </div>
            </div>
            <div>
              {isStudentMeal(editCategory.name) && (
                <>
                  <hr />
                  <div className="modal-category mb-3">
                    <p>Time Range:</p>
                    <div className="d-flex align-items-center justify-content-center pt-0">
                      <div className="input-group ms-2">
                        <label className="pt-2 pe-2">From:</label>
                        <input
                          type="time"
                          className="form-control mb-0"
                          value={editCategory.time_from || ""}
                          onChange={(e) => handleTimeChange(e, "time_from")}
                        />
                        <label className="pt-2 pe-1 ms-2">To:</label>
                        <input
                          type="time"
                          className="form-control ms-2 mb-0"
                          value={editCategory.time_to || ""}
                          onChange={(e) => handleTimeChange(e, "time_to")}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Modal.Body>

          <Modal.Footer>
            {!loadingBtn ? (
              <>
                {/* {authrztn?.includes("Product-Delete") && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDeleteCategory}
                    disabled={isStudentMeal(editCategory.name)}
                  >
                    Delete
                  </Button>
                )} */}
                <Button variant="primary" type="submit">
                  Update
                </Button>
              </>
            ) : (
              <>
                <div className="d-flex w-50 justify-content-end p-0">
                  <ReactLoading
                    color="blue"
                    type={"spinningBubbles"}
                    height={"10%"}
                    width={"10%"}
                  />
                  <span
                    style={{
                      fontSize: "2rem",
                      marginTop: "10px",
                      marginLeft: "5px",
                    }}
                  >
                    {processLabel}. . .
                  </span>
                </div>
              </>
            )}
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal for Archive */}
      <Modal show={showArchiveModal} onHide={handleCloseArchiveModal} centered>
        <Modal.Header>
          <Modal.Title>
            <h2>Do you want to archive this Product?</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-category justify-content-center">
            <label htmlFor="">Description</label>
            <div class="form-floating">
              <textarea
                class="form-control mb-0"
                placeholder="Leave a comment here "
                id="floatingTextarea2"
                style={{ height: "20rem", fontSize: "1.2em" }}
                onChange={(e) => setRemarks(e.target.value)}
                value={remarks}
                required
              ></textarea>
              <label for="floatingTextarea2">Remarks</label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {!loadingBtn ? (
            <>
              <Button variant="primary" onClick={handleArchiveProduct}>
                Confirm
              </Button>
            </>
          ) : (
            <>
              <div className="d-flex w-50 justify-content-end p-0">
                <ReactLoading
                  color="blue"
                  type={"spinningBubbles"}
                  height={"10%"}
                  width={"10%"}
                />
                <span
                  style={{
                    fontSize: "2rem",
                    marginTop: "10px",
                    marginLeft: "5px",
                  }}
                >
                  Archiving. . .
                </span>
              </div>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductCategory;
