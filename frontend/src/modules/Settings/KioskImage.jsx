import React, { useEffect, useRef, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import eli_logo from "../../assets/image/eli-logo.png";
import mainScreen from "../../assets/icon/pizza.jpg";
import carb from "../../assets/icon/carbonara.jpg";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
import { Button, Modal } from "react-bootstrap";
import swal from "sweetalert";
import noData from "../../assets/icon/no-data.png";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import { jwtDecode } from "jwt-decode";
import Card from "react-bootstrap/Card";
import ReactLoading from "react-loading";
const KioskImage = () => {
  const [kioskImages, setKioskImages] = useState([]);
  const [bannerImages, setBannerImages] = useState([]);
  const [userType, setTypeUser] = useState("");
  const [showAddImageKioskModal, setShowAddImageKioskModal] = useState(false);
  const [showAddKioskBannerModal, setShowKioskBannerModal] = useState(false);
  const [showEditImage, setShowEditImage] = useState(false);
  const [showBannerEditImage, setShowBannerEditImage] = useState(false);
  const [kioskCurrentImages, setKioskCurrentImages] = useState([]);
  const [kioskBannerImages, setKioskBannerImages] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedImages, setSelectedImages] = useState({
    type: "",
    base64: "",
  });
  const [specificBanner, setSpecificBanner] = useState("");
  const [idImage, setIdImage] = useState("");
  const fileInputRef = useRef(null);
  const fileSpecificInputRef = useRef(null);

  function selectFiles() {
    fileInputRef.current.click();
  }

  function selectSpecificFile() {
    fileSpecificInputRef.current.click();
  }

  const handleCloseKioskModal = () => {
    setShowAddImageKioskModal(false);
    setKioskImages([]);
  };
  const handleCloseKioskBannerModal = () => {
    setShowKioskBannerModal(false);
    setKioskImages([]);
  };
  const handleOpenKioskModal = () => {
    setShowAddImageKioskModal(true);
  };

  const handleOpenKioskBannerModal = () => {
    setShowKioskBannerModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditImage(false);
    setIdImage("");
    setSelectedImages("");
  };
  const handleCloseEditBannerModal = () => {
    setShowBannerEditImage(false);
    setIdImage("");
    setSelectedImages("");
  };
  const onFileBannerSelect = (event) => {
    const selectedFiles = event.target.files;
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB LIMIT

    if (selectedFiles.length + kioskImages.length > 4) {
      swal({
        icon: "error",
        title: "File Selection Error",
        text: "You can only upload up to 4 images.",
      });
      return;
    }

    const newImages = Array.from(selectedFiles).filter((file) => {
      if (!allowedTypes.includes(file.type) || file.size > maxSize) {
        swal({
          icon: "error",
          title: "File Selection Error",
          text: "Please select a valid image file (PNG, JPEG, JPG, or WEBP) with a maximum size of 5MB.",
        });
        return false;
      }
      return true;
    });

    const readers = newImages.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve(reader.result.split(",")[1]); // Only the base64 string
        };
      });
    });

    Promise.all(readers).then((base64Images) => {
      setBannerImages((prevImages) => [...prevImages, ...base64Images]);
    });
  };
  const onFilespecificBannerSelect = (event) => {
    const selectedSpecificFile = event.target.files[0]; // Assuming only one file is selected
    const allowedspecificTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    const maxSpecificSize = 5 * 1024 * 1024; // 5MB LIMIT

    if (
      selectedSpecificFile &&
      allowedspecificTypes.includes(selectedSpecificFile.type) &&
      selectedSpecificFile.size <= maxSpecificSize
    ) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedSpecificFile);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        setSelectedImages({
          base64: base64String,
          type: selectedSpecificFile.type, // Store the type
        });
      };
    } else {
      swal({
        icon: "error",
        title: "File Selection Error",
        text: "Please select a valid image file (PNG, JPEG, JPG, or WEBP) with a maximum size of 5MB.",
      });
    }
  };

  const onFileSelect = (event) => {
    const selectedFiles = event.target.files;
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];
    const maxSize = 25 * 1024 * 1024; // 25MB LIMIT

    if (selectedFiles.length + kioskImages.length > 4) {
      swal({
        icon: "error",
        title: "File Selection Error",
        text: "You can only upload up to 4 images or videos.",
      });
      return;
    }

    const newFiles = Array.from(selectedFiles).filter((file) => {
      if (!allowedTypes.includes(file.type) || file.size > maxSize) {
        swal({
          icon: "error",
          title: "File Selection Error",
          text: `Please select a valid file (PNG, JPEG, JPG, WEBP, MP4, WEBM) with a maximum size of 25MB.`,
        });
        return false;
      }
      return true;
    });

    const readers = newFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve({
            base64: reader.result.split(",")[1], // Only the base64 string
            type: file.type, // Store the file type
          });
        };
      });
    });

    Promise.all(readers).then((base64Files) => {
      setKioskImages((prevImages) => [...prevImages, ...base64Files]);
    });
  };

  const onFilespecificSelect = (event) => {
    const selectedSpecificFile = event.target.files[0]; // Assuming only one file is selected
    const allowedspecificTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];
    const maxSpecificSize = 25 * 1024 * 1024;

    if (
      selectedSpecificFile &&
      allowedspecificTypes.includes(selectedSpecificFile.type) &&
      selectedSpecificFile.size <= maxSpecificSize
    ) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedSpecificFile);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        setSelectedImages({
          base64: base64String,
          type: selectedSpecificFile.type, // Store the type
        });
      };
    } else {
      swal({
        icon: "error",
        title: "File Selection Error",
        text: "Please select a valid file (PNG, JPEG, JPG, WEBP, MP4, WEBM) with a maximum size of 25MB.",
      });
    }
  };
  const mainKioskColumn = [
    {
      name: "Media",
      selector: (row) => {
        const isImage = row.type && row.type.startsWith("image");
        const isVideo = row.type && row.type.startsWith("video");

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isImage && (
              <img
                src={`data:image/jpeg;base64,${row.kiosk_img}`}
                alt="Kiosk"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            )}
            {isVideo && (
              <video
                src={`data:video/mp4;base64,${row.kiosk_img}`}
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
                controls
              />
            )}
          </div>
        );
      },
    },
    {
      name: "Action",
      selector: (row) => (
        <>
          <i
            class="bx bxs-edit"
            style={{ color: "green" }}
            onClick={() => handleShowEditImage(row)}
          ></i>{" "}
          <i
            class="bx bxs-trash"
            style={{ color: "red" }}
            onClick={() => handleAskDelete(row.kiosk_img_id)}
          ></i>
        </>
      ),
    },
  ];

  const handleFetchImages = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/kiosk_settings/fetchKioskImgs`
      );

      const filteredImages =
        userType !== "Superadmin"
          ? response.data.filter((image) => image.uploaded_by !== "Superadmin")
          : response.data;

      setKioskCurrentImages(filteredImages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFetchBanner = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/kiosk_settings/fetchKioskImgsBanner`
      );

      const filteredImages =
        userType !== "Superadmin"
          ? response.data.filter((image) => image.uploaded_by !== "Superadmin")
          : response.data;

      setKioskBannerImages(filteredImages);
    } catch (error) {
      console.error(error);
    }
  };

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setTypeUser(decoded.typeUser);
    }
  };
  useEffect(() => {
    decodeToken();
  }, []);

  useEffect(() => {
    if (userType) {
      handleFetchImages();
      handleFetchBanner();
    }
  }, [userType]);

  useEffect(() => {
    console.log(selectedImages);
  }, [selectedImages]);

  const handleSaveImages = async () => {
    try {
      setLoadingBtn(true);
      const response = await axios.post(
        `${BASE_URL}/kiosk_settings/save_kiosk_image`,
        {
          images: kioskImages,
          userType: userType,
          locType: "kiosk-main",
        }
      );

      if (response.status === 200) {
        swal("Success!", "Images uploaded successfully!", "success");
        setShowAddImageKioskModal(false);
        handleFetchImages();
        setKioskImages([]);
        setLoadingBtn(false);
      } else if (response.status === 201) {
        swal({
          title: "Only 4 images can be uploaded!",
          icon: "error",
          button: "OK",
        });
        setShowAddImageKioskModal(false);
        setLoadingBtn(false);
      }
    } catch (error) {
      console.error(error);
      setLoadingBtn(false);
    }
  };

  const handleSaveBannerImages = async () => {
    try {
      setLoadingBtn(true);
      const response = await axios.post(
        `${BASE_URL}/kiosk_settings/save_kiosk_image`,
        {
          images: bannerImages,
          userType: userType,
          locType: "banner",
        }
      );

      if (response.status === 200) {
        swal("Success!", "Images uploaded successfully!", "success");
        setShowKioskBannerModal(false);
        handleFetchBanner();
        setBannerImages([]);
        setLoadingBtn(false);
      } else if (response.status === 201) {
        swal({
          title: "Only 4 images can be uploaded!",
          icon: "error",
          button: "OK",
        });
        setShowKioskBannerModal(false);
        setLoadingBtn(false);
      }
    } catch (error) {
      console.error(error);
      setLoadingBtn(false);
    }
  };

  const handleShowEditImage = (row) => {
    setSelectedImages({
      base64: row.kiosk_img,
      type: row.type,
    });
    setIdImage(row.kiosk_img_id);
    if (row.img_screen_loc == "kiosk-main") {
      setShowEditImage(true);
    } else {
      setShowBannerEditImage(true);
    }
  };

  const handleEditImage = async () => {
    try {
      const selectedFileType = selectedImages.type;

      const res = await axios.put(`${BASE_URL}/kiosk_settings/editKioskImgs`, {
        id: idImage,
        img: selectedImages.base64,
        type: selectedFileType,
      });

      if (res.status === 200) {
        swal({
          title: "Image successfully updated!",
          icon: "success",
          button: "OK",
        });
      }
      handleFetchImages();
      handleFetchBanner();
      handleCloseEditModal();
      handleCloseEditBannerModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMainImage = async (id) => {
    try {
      const res = await axios.delete(
        `${BASE_URL}/kiosk_settings/deleteKioskImgs`,
        {
          data: { img_id: id },
        }
      );
      if (res.status == 200) {
        swal({
          title: "Image successfully deleted!",
          icon: "success",
          button: "OK",
        });
      }

      handleFetchImages();
      handleFetchBanner();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAskDelete = (id) => {
    try {
      swal({
        icon: "warning",
        title: `Do you want to delete this image? `,
        text: `Delete the image?`,
        buttons: {
          excel: {
            text: "YES",
            value: "YES",
            className: "--excel",
          },
          pdf: {
            text: "NO",
            value: "NO",
            className: "--pdf",
          },
        },
      }).then((value) => {
        if (value === "YES") {
          handleDeleteMainImage(id);
        } else {
          swal.close();
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteImage = (index) => {
    const updatedImages = kioskImages.filter((_, i) => i !== index);
    setKioskImages(updatedImages);
  };

  const deleteImageBanner = (index) => {
    const updatedImages = bannerImages.filter((_, i) => i !== index);
    setBannerImages(updatedImages);
  };

  useEffect(() => {
    console.log(kioskImages);
  }, [kioskImages]);
  return (
    <>
      <div className="kiosk-img">
        <div className="kiosk-main-prev">
          <div className="hardware-kiosk-img">
            <div className="receipt-type-container ms-0">
              <h2>Main Kiosk Screen Images:</h2>
            </div>
            <div style={{ paddingTop: "20px" }}>
              <button
                className="btn btn-lg btn-outline-primary text-nowrap py-3 py-md-4 px-3 px-md-5"
                onClick={handleOpenKioskModal}
              >
                ADD IMAGES
              </button>
            </div>
          </div>
          <div className="kiosk-imgs pt-3">
            {kioskCurrentImages.length == 0 ? (
              <>
                <div className="no-data-table">
                  <table>
                    <thead>
                      <th>Images</th>
                      <th>Action</th>
                    </thead>
                    <tbody>
                      <img
                        src={noData}
                        alt="No Data"
                        className="no-data-icon"
                      />
                      <h2 className="no-data-label">No Data Found</h2>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <DataTable
                  columns={mainKioskColumn}
                  customStyles={customStyles}
                  data={kioskCurrentImages}
                  pagination
                />
              </>
            )}
          </div>
        </div>

        <hr />
        <div className="kiosk-main-prev">
          <div className="hardware-kiosk-img">
            <div className="receipt-type-container ms-0">
              <h2>Banner Kiosk Images:</h2>
            </div>
            <div style={{ paddingTop: "20px" }}>
              <button
                className="btn btn-lg btn-outline-primary text-nowrap py-3 py-md-4 px-3 px-md-5"
                onClick={handleOpenKioskBannerModal}
              >
                ADD IMAGES
              </button>
            </div>
          </div>
          <div className="kiosk-imgs pt-3">
            {kioskBannerImages.length == 0 ? (
              <>
                <div className="no-data-table">
                  <table>
                    <thead>
                      <th>Images</th>
                      <th>Action</th>
                    </thead>
                    <tbody>
                      <img
                        src={noData}
                        alt="No Data"
                        className="no-data-icon"
                      />
                      <h2 className="no-data-label">No Data Found</h2>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <DataTable
                  columns={mainKioskColumn}
                  customStyles={customStyles}
                  data={kioskBannerImages}
                  pagination
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Modal show={showAddImageKioskModal} onHide={handleCloseKioskModal}>
        <Modal.Header>
          <Modal.Title>
            <h2>Upload Kiosk Screen Image</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="uploading-kiosk-image-section pt-2">
            <span className="select" role="button" onClick={selectFiles}>
              Upload
            </span>
            <input
              name="file"
              type="file"
              className="file"
              ref={fileInputRef}
              onChange={onFileSelect}
              required
              multiple
            />
          </div>

          {kioskImages.length == 0 ? (
            <>
              <div className="card-no-data">
                <h2>No Images/Videos Selected </h2>
              </div>
            </>
          ) : (
            <>
              <div className="card-grid">
                {/* {kioskImages.map((image, index) => (
                  <div className="card-container" key={index}>
                    <Card
                      style={{
                        width: "18rem",
                        margin: "10px",
                        padding: "10px",
                        height: "20rem",
                        position: "relative",
                      }}
                    >
                      <button
                        className="close-btn"
                        onClick={() => deleteImage(index)}
                      >
                        &times;
                      </button>
                      <Card.Img
                        variant="top"
                        style={{
                          width: "-webkit-fill-available",
                          height: "-webkit-fill-available",
                        }}
                        src={`data:image/png;base64,${image}`}
                        alt={`kiosk-${index}`}
                      />
                    </Card>
                  </div>
                ))} */}
                {(kioskImages || []).map((image, index) => (
                  <div className="card-container" key={index}>
                    <Card
                      style={{
                        width: "18rem",
                        margin: "10px",
                        padding: "10px",
                        height: "20rem",
                        position: "relative",
                      }}
                    >
                      <button
                        className="close-btn"
                        onClick={() => deleteImage(index)}
                      >
                        &times;
                      </button>

                      {image.type.startsWith("video") ? (
                        <video
                          src={`data:video/mp4;base64,${image.base64}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          controls
                        />
                      ) : (
                        <Card.Img
                          variant="top"
                          style={{
                            width: "-webkit-fill-available",
                            height: "-webkit-fill-available",
                          }}
                          src={`data:${image.type};base64,${image.base64}`}
                          alt={`kiosk-${index}`}
                        />
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 
          <table className="custom-user-table user-transac-table">
            <thead>
              <tr>
                <th>Images</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {kioskImages.map((image, index) => (
                <tr key={index} className="kiosk-image-item">
                  <td>
                    <img
                      src={`data:image/png;base64,${image}`}
                      alt={`kiosk-${index}`}
                      style={{ width: "100px", margin: "10px" }}
                    />
                  </td>
                  <td>
                    {" "}
                    <button
                      className="delete-image-btn"
                      onClick={() => deleteImage(index)}
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table> */}
        </Modal.Body>
        <Modal.Footer>
          {!loadingBtn ? (
            <>
              <Button variant="outline-primary" onClick={handleCloseKioskModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveImages}>
                Save
              </Button>
            </>
          ) : (
            <>
              <div className="d-flex w-50 justify-content-end p-0">
                <ReactLoading
                  color="blue"
                  type={"spinningBubbles"}
                  height={"15%"}
                  width={"15%"}
                />
                <span
                  style={{
                    fontSize: "2rem",
                    marginLeft: "5px",
                  }}
                >
                  Saving. . .
                </span>
              </div>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Banner */}
      <Modal
        show={showAddKioskBannerModal}
        onHide={handleCloseKioskBannerModal}
      >
        <Modal.Header>
          <Modal.Title>
            <h2>Upload Kiosk Banner Image</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="uploading-kiosk-image-section pt-2">
            <span className="select" role="button" onClick={selectFiles}>
              Upload
            </span>
            <input
              name="file"
              type="file"
              className="file"
              ref={fileInputRef}
              onChange={onFileBannerSelect}
              required
              multiple
            />
          </div>

          {bannerImages.length == 0 ? (
            <>
              <div className="card-no-data">
                <h2>No Images Selected </h2>
              </div>
            </>
          ) : (
            <>
              <div className="card-grid">
                {bannerImages.map((image, index) => (
                  <div className="card-container" key={index}>
                    <Card
                      style={{
                        width: "18rem",
                        margin: "10px",
                        padding: "10px",
                        height: "20rem",
                        position: "relative",
                      }}
                    >
                      <button
                        className="close-btn"
                        onClick={() => deleteImageBanner(index)}
                      >
                        &times;
                      </button>
                      <Card.Img
                        variant="top"
                        style={{
                          width: "-webkit-fill-available",
                          height: "-webkit-fill-available",
                        }}
                        src={`data:image/png;base64,${image}`}
                        alt={`kiosk-${index}`}
                      />
                    </Card>
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!loadingBtn ? (
            <>
              <Button
                variant="outline-primary"
                onClick={handleCloseKioskBannerModal}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveBannerImages}>
                Save
              </Button>
            </>
          ) : (
            <>
              <div className="d-flex w-50 justify-content-end p-0">
                <ReactLoading
                  color="blue"
                  type={"spinningBubbles"}
                  height={"15%"}
                  width={"15%"}
                />
                <span
                  style={{
                    fontSize: "2rem",
                    marginLeft: "5px",
                  }}
                >
                  Saving. . .
                </span>
              </div>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal Editing Image */}
      <Modal show={showEditImage} onHide={handleCloseEditModal}>
        <Modal.Header>
          <Modal.Title>
            <h2>Edit Image</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="uploading-kiosk-image-section">
            <span className="select" role="button" onClick={selectSpecificFile}>
              Upload
            </span>
            <input
              name="file"
              type="file"
              className="file"
              ref={fileSpecificInputRef}
              onChange={onFilespecificSelect}
              required
              multiple
            />
          </div>
          <div className="d-flex p-0 justify-content-center">
            <Card
              style={{
                width: "18rem",
                margin: "10px",
                padding: "10px",
                height: "20rem",
                position: "relative",
              }}
            >
              {selectedImages && selectedImages.base64 ? (
                selectedImages.type.startsWith("video/mp4") ? (
                  <video
                    src={`data:video/mp4;base64,${selectedImages.base64}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    controls
                  />
                ) : (
                  <Card.Img
                    variant="top"
                    style={{
                      width: "-webkit-fill-available",
                      height: "-webkit-fill-available",
                    }}
                    src={`data:${selectedImages.type};base64,${selectedImages.base64}`}
                    alt={`kiosk`}
                  />
                )
              ) : (
                <div>No media selected</div>
              )}
            </Card>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditImage}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Banner Image */}

      <Modal show={showBannerEditImage} onHide={handleCloseEditBannerModal}>
        <Modal.Header>
          <Modal.Title>
            <h2>Edit Banner Image</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="uploading-kiosk-image-section">
            <span className="select" role="button" onClick={selectSpecificFile}>
              Upload
            </span>
            <input
              name="file"
              type="file"
              className="file"
              ref={fileSpecificInputRef}
              onChange={onFilespecificBannerSelect}
              required
              multiple
            />
          </div>
          <div className="d-flex p-0 justify-content-center">
            <Card
              style={{
                width: "18rem",
                margin: "10px",
                padding: "10px",
                height: "20rem",
                position: "relative",
              }}
            >
              {selectedImages && selectedImages.base64 ? (
                selectedImages.type.startsWith("video/mp4") ? (
                  <video
                    src={`data:video/mp4;base64,${selectedImages.base64}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    controls
                  />
                ) : (
                  <Card.Img
                    variant="top"
                    style={{
                      width: "-webkit-fill-available",
                      height: "-webkit-fill-available",
                    }}
                    src={`data:${selectedImages.type};base64,${selectedImages.base64}`}
                    alt={`kiosk`}
                  />
                )
              ) : (
                <div>No media selected</div>
              )}
            </Card>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            onClick={handleCloseEditBannerModal}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditImage}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default KioskImage;
