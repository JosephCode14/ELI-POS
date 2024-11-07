import React, {useEffect, useState} from 'react';
import Button from "react-bootstrap/Button";
import ListGroup from 'react-bootstrap/ListGroup';
import '../../assets/global/style.css';
import '../styles/react-style.css';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Select from "react-select";
import swal from "sweetalert";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import { color } from '@mui/system';
import { HiMiniPencilSquare } from "react-icons/hi2";


import {
  MagnifyingGlass,
  Gear, 
  Bell,
  UserCircle,
  Plus,
  Trash,
  NotePencil,
  DotsThreeCircle
} from "@phosphor-icons/react";

function CategoryManagement() {
//--------------------------------Category---------------------------------//
    const [Category, setCategory] = useState([]);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleUpdateClose = () => setUpdateModalShow(false);
    const handleShow = () => setShow(true);
    const [updateModalShow, setUpdateModalShow] = useState(false);

    const [showDropdown, setShowDropdown] = useState(false);
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const [rotatedIcons, setRotatedIcons] = useState(
        Array(Category.length).fill(false)
      );
    const [validated, setValidated] = useState(false);

    const [updateFormData, setUpdateFormData] = useState({
        categoryId: "",
        name: "",
        tax_information: "",
        description: "",
      });

    const toggleDropdown = (event, index) => {
        // Check if the clicked icon is already open, close it
        if (index === openDropdownIndex) {
          setRotatedIcons((prevRotatedIcons) => {
            const newRotatedIcons = [...prevRotatedIcons];
            newRotatedIcons[index] = !newRotatedIcons[index];
            return newRotatedIcons;
          });
          setShowDropdown(false);
          setOpenDropdownIndex(null);
        } else {
          // If a different icon is clicked, close the currently open dropdown and open the new one
        //   setRotatedIcons(Array(Manufacturer.length).fill(false));
          const iconPosition = event.currentTarget.getBoundingClientRect();
          setDropdownPosition({
            top: iconPosition.bottom + window.scrollY,
            left: iconPosition.left + window.scrollX,
          });
          setRotatedIcons((prevRotatedIcons) => {
            const newRotatedIcons = [...prevRotatedIcons];
            newRotatedIcons[index] = true;
            return newRotatedIcons;
          });
          setShowDropdown(true);
          setOpenDropdownIndex(index);
        }
      };

      const [name, setName] = useState();
      const [tax_information, setTaxInformation] = useState();
      const [description, setDescription] = useState();

//--------------------------------Reload Table---------------------------------//
      const reloadTable = () => {
        axios
          .get(BASE_URL + '/category/getCategory')
          .then((res) => {
            setCategory(res.data);
          })
          .catch((err) => console.log(err));
      };
//--------------------------------End Reload Table---------------------------------//     

//--------------------------------Product Category list fetch---------------------------------//
useEffect(() => {
    axios
      .get(BASE_URL + "/category/getCategory")
      .then((res) => setCategory(res.data))
      .catch((err) => console.log(err));
  }, []);
//--------------------------------End Product Category list fetch---------------------------------//

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
          tax_information: res.data.tax_information,
          description: res.data.description,
          createdAt: res.data.createdAt,
          updatedAt: res.data.updatedAt,
        },
      ]);

      setName(""); 
      setTaxInformation("");
      setDescription("");

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
  };

  const ErrorInserted = () => {
    swal({
      title: "Something went wrong",
      text: "Please Contact our Support",
      icon: "error",
      button: "OK",
    });
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
//--------------------------------End of Validations---------------------------------//

//--------------------------------Show Modal Update---------------------------------//
const handleModalToggle = (updateData = null) => {
    setUpdateModalShow(!updateModalShow);
    if (updateData) {
      setUpdateFormData({
        categoryId: updateData.category_id,
        name: updateData.name,
        tax_information: updateData.tax_information,
        description: updateData.description,
      });
    } else {
      setUpdateFormData({
        categoryId: "",
        name: "",
        description: "",
        tax_information: "",
      });
    }
  };
//--------------------------------End Show Modal Update---------------------------------//

//--------------------------------Add Product Category---------------------------------//
const addCategory = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        icon: "error",
        title: "Fields are required",
        text: "Please fill the red text fields",
      });
    } else {
      axios
        .post(`${BASE_URL}/category/create`, {
          name: name,
          tax_information: tax_information,
          description: description,
        })
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            SuccessInserted(res);
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

//--------------------------------Update Product Category---------------------------------//
const updateCategory = async (e) => {
    e.preventDefault();

    if (!updateFormData.name) {
      swal({
        icon: "error",
        title: "Name is required",
        text: "Please enter a name before updating.",
      });
      return;
    }

    try {
      const categoryId = updateFormData.categoryId;
      const response = await axios.put(
        BASE_URL + `/category/update/${categoryId}`,
        {
            name: updateFormData.name,
            tax_information: updateFormData.tax_information,
            description: updateFormData.description,
        }
      );

      if (response.status === 200) {
        swal({
          title: "Update successful!",
          text: "The Product Category has been updated successfully.",
          icon: "success",
          button: "OK",
        }).then(() => {
          handleModalToggle();
          setCategory((prev) =>
            prev.map((data) =>
              data.category_id === updateFormData.category_id
                ? {
                    ...data,
                    name: updateFormData.name,
                    tax_information: updateFormData.tax_information,
                    description: updateFormData.description,
                  }
                : data
            )
          );
          reloadTable();
          setUpdateFormData({
            name: "",
            tax_information: "",
            description: "",
          });

        });
      } else if (response.status === 202) {
        swal({
          icon: "error",
          title: "Product Category has been already exists",
          text: "Please input another Product Category Name",
        });
      } else {
        swal({
          icon: "error",
          title: "Something went wrong",
          text: "Please contact our support",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
//--------------------------------End Update Product Category---------------------------------//

//--------------------------------Delete Product Category---------------------------------//
const handleDelete = async (categoryId) => {
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this record file!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then(async (willDelete) => {
    if (willDelete) {
      try {
        const response = await axios.delete(
          BASE_URL + `/category/delete/${categoryId}`
        );

        if (response.status === 200) {
          swal({
            title: "Deleted Successful!",
            text: "The Product Category has been Deleted Successfully.",
            icon: "success",
            button: "OK",
          }).then(() => {
            setCategory((prev) => prev.filter((data) => data.id !== categoryId));
            setUpdateModalShow(false);
            reloadTable();
          });
        } else if (response.status === 202) {
          swal({
            icon: "error",
            title: "Delete Prohibited",
            text: "You cannot delete Product Category that is used",
          });
        } else {
          swal({
            icon: "error",
            title: "Something went wrong",
            text: "Please contact our support",
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      swal({
        title: "Cancelled",
        text: "Product Category not Deleted!",
        icon: "warning",
      });
    }
  });
};
//--------------------------------End Delete Product Category---------------------------------//


//--------------------------------Date Format---------------------------------//
    function formatDate(isoDate) {
    const date = new Date(isoDate);
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(
        date.getDate()
    )} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(
        date.getSeconds()
    )}`;
    }

    function padZero(num) {
    return num.toString().padStart(2, "0");
    }
//--------------------------------End Date Format---------------------------------//
//--------------------------------End of Category---------------------------------//



//***********************************************Start of Product************************************************//
const [Product, setProduct] = useState([]);
const [productName, setProductName] = useState("");
const [price, setPrice] = useState("");

//--------------------------------Product list fetch---------------------------------//
useEffect(() => {
  axios
    .get(BASE_URL + "/product/getProduct")
    .then((res) => setProduct(res.data))
    .catch((err) => console.log(err));
}, []);
//--------------------------------End Product list fetch---------------------------------//

//--------------------------------Add Product---------------------------------//
const [selectedCategories, setSelectedCategories] = useState([]);

const handleCategoryChange = (selectedOptions) => {
  setSelectedCategories(selectedOptions);
};

const addProduct = async (e) => {
  e.preventDefault();

  const form = e.currentTarget;

  const dataToSend = selectedCategories.map(category => category.value);

  if (form.checkValidity() === false) {
    e.preventDefault();
    e.stopPropagation();
    swal({
      icon: "error",
      title: "Fields are required",
      text: "Please fill the red text fields",
    });
  } else {
    try {
      const res = await axios.post(`${BASE_URL}/product/create`, {
        name: productName,
        price: price,
        category_id: dataToSend,
      });

      console.log(res);
      if (res.status === 200) {
        SuccessInserted(res);
        reloadTableProduct();
        resetFormProduct();
      } else if (res.status === 201) {
        Duplicate_Message();
      } else {
        ErrorInserted();
      }
    } catch (error) {
      console.error(error);
      ErrorInserted();
    }
  }
  setValidated(true); //for validations
};

//--------------------------------End Product---------------------------------//

//--------------------------------Reload Table Product---------------------------------//
const reloadTableProduct = () => {
  axios
    .get(BASE_URL + '/product/getProduct')
    .then((res) => {
      setProduct(res.data);
    })
    .catch((err) => console.log(err));
};
//--------------------------------End Reload Table Product---------------------------------//   

//--------------------------------Reset Form---------------------------------//
const resetFormProduct = () => {
  setProductName('');
  setPrice('');
}
//--------------------------------End Reset Form---------------------------------//    

//***********************************************End of Product*************************************************//




  return (
    <div className="row">

      {/* ----------------------------------START CATEGORY---------------------------------------------------- */}
      <div className="col-md-3 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <p class="card-title">Category</p>

              <Button variant='success' onClick={handleShow}>
                  Add
              </Button>

              {/* <canvas id="sales-chart" width="100%" height="956" style={{display: "block", boxSzing: "border-box", height: "100%", width: "956px"}}></canvas>  */}
            </div>

            <table className='table-hover' id='order-listing'>
              <thead>
              
              </thead>
              <tbody>
                  {Category.map((data, i) => (
                      <tr key={i}>
                      <td>{data.name}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td onClick={() => handleModalToggle(data)}><HiMiniPencilSquare/></td>
                      </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {/* ----------------------------------MODAL FOR CREATE---------------------------------------------------- */}
        <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size="md">
        <Form
          noValidate
          validated={validated}
          onSubmit={addCategory}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "24px" }}>
              Add New Category
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1">
                  <Form.Label style={{ fontSize: "18px" }}>Name: </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    required
                    onChange={(e) => setName(e.target.value)}
                    style={{ height: "40px", fontSize: "15px" }}
                  />
                </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="submit"
              variant="success"
              size="md"
              style={{ fontSize: "20px" }}>
              Save
            </Button>
            <Button
              variant="outline-primary"
              size="md"
              style={{ fontSize: "20px" }}
              onClick={handleClose}>
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* ---------------------------------- END MODAL FOR CREATE---------------------------------------------------- */}
      {/* ---------------------------------- MODAL FOR UPDATE---------------------------------------------------- */}
      <Modal
        show={updateModalShow}
        onHide={() => handleModalToggle()}
        backdrop="static"
        keyboard={false}
        size="md">
        <Form
          noValidate
          validated={validated}
          onSubmit={updateCategory}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "24px" }}>
              Update Product Category 
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1">
                  <Form.Label style={{ fontSize: "18px" }}>Name: </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    name="name"
                    required
                    value={updateFormData.name}
                    onChange={handleUpdateFormChange}
                    style={{ height: "40px", fontSize: "15px" }}
                  />
                </Form.Group>          
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="submit"
              variant="success"
              size="md"
              style={{ fontSize: "20px" }}>
              Save
            </Button>
            <Button
              variant="outline-primary"
              size="md"
              style={{ fontSize: "20px" }}
              onClick={handleUpdateClose}>
              Cancel
            </Button>
            <Button
              variant="outline-primary"
              size="md"
              style={{ fontSize: "20px"}}
              onClick={() => handleDelete(updateFormData.categoryId)}>
              Delete
            </Button>
            
          </Modal.Footer>
        </Form>
      </Modal>
      {/* ---------------------------------- END MODAL FOR UPDATE---------------------------------------------------- */}
        </div>
      </div>
{/* ---------------------------------- END CATEGORY---------------------------------------------------- */}

{/* ----------------------------------START PRODUCT TABLE---------------------------------------------------- */}               
      <div className="col-md-5 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
          <div className="d-flex justify-content-between">
          <p class="card-title">Product</p>

          <Button variant='success' onClick={handleShow}>
              Add
          </Button>            
          </div>
          <table className='table-hover' id='order-listing'>
              <thead>
              </thead>
              <tbody>
                  {Product.map((data, i) => (
                      <tr key={i}>
                      <td>{data.name}</td>
                      </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <canvas id="sales-chart" width="100%" height="572" style= {{display: "block", boxSizing: "border-box", height: "70%", width: "572px"}}></canvas>
        </div>
      </div>
{/* ----------------------------------END PRODUCT TABLE---------------------------------------------------- */}


{/* ----------------------------------START PRODUCT CREATE---------------------------------------------------- */}
      <div className="col-md-4 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between">
            <p class="card-title">Product Information</p>
            </div>

            <Form
              noValidate
              validated={validated}
              onSubmit={addProduct}>
            <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1">
                  <Form.Label style={{ fontSize: "18px" }}>Name: </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    required
                    value={productName}
                    style={{ height: "40px", fontSize: "15px" }}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="exampleForm.ControlInput2">
                  <Form.Label style={{ fontSize: "20px" }}>
                    Category:{" "}
                  </Form.Label>
                  <Select
                    isMulti
                    options={Category.map((category) => ({
                      value: category.category_id,
                      label: category.name,
                    }))}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        color: 'red', 
                        fontSize: '15px',
                        fontWeight: 650
                      }),
                      option: (provided) => ({
                        ...provided,
                        color: 'black', 
                        fontSize: '15px', 
                      }),
                    }} 
                    // onChange={handleCategoryChange}
                    onChange={(selected) => setSelectedCategories(selected)}
                  />
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1">
                  <Form.Label style={{ fontSize: "18px" }}>Price: </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    required
                    value={price}
                    style={{ height: "40px", fontSize: "15px" }}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="success"
                  size="md"
                  style={{ fontSize: "20px" }}>
                  Save
                </Button>
                <Button
                  variant="outline-primary"
                  size="md"
                  style={{ fontSize: "20px" }}
                  onClick={handleClose}>
                  Cancel
                </Button>
              </Form>
          </div>
        </div>
      </div>
{/* ---------------------------------- END PRODUCT CREATE---------------------------------------------------- */}
</div>

  )
}

export default CategoryManagement