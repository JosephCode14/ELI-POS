import React, {useState } from 'react';
import Sidebar from '../../../Sidebar/sidebar';
import axios from 'axios';
import '../../../../assets/global/style.css';
import '../../../styles/react-style.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import swal from 'sweetalert';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import Form from 'react-bootstrap/Form';
import BASE_URL from '../../../../assets/global/url';
import {
  MagnifyingGlass,
  Gear, 
  Bell,
  UserCircle,
} from "@phosphor-icons/react";
import { border } from '@mui/system';

function Create_role() {
  const navigate = useNavigate();
// Inserting to database checkboxes
const [searchQuery, setSearchQuery] = useState('');
const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

const handleRoleNameInput = (e) => {
  const inputValue = e.target.value;
  const isValid = /^[a-zA-Z\s',.\-]+$/.test(inputValue);
  if (!isValid) {
    // Show an error message or prevent further input
    e.target.setCustomValidity("Invalid role name");
  } else {
    e.target.setCustomValidity(""); // Clear any previous validation message
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const rolename = document.getElementsByName("rolename")[0].value;
  const desc = document.getElementsByName("desc")[0].value;

  if(rolename === ''){
    swal({
      title: 'Required Field',
      text: 'Rolename is required',
      icon: 'error',
      button: 'OK'
    })  
  }
  else if(desc === ''){
    swal({
      title: 'Required Field',
      text: 'Description is required',
      icon: 'error',
      button: 'OK'
    })  
  }
  else{
    try {
      const response = await fetch(BASE_URL + `/userRole/createUserrole/${rolename}`, {
        rolename,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedCheckboxes: selectedCheckboxes.map(item => ({
            ...item,
            rolename,
            desc
          }))
        }),
      });
  
  
      if (response.status === 200) {
        swal({
          icon: 'success',
          title: 'Success!',
          text: 'User roles created successfully!',
        })
        .then(() => {
          navigate("/userRole");
        });
    } 
    else if (response.status === 202) {
        swal({
          icon: 'error',
          title: 'Rolename already exist',
          text: 'Please input another rolename',
        });
    } 
    // else {
    //     swal({
    //     icon: 'error',
    //     title: 'Oops...',
    //     text: 'Something went wrong!',
    //     });
    // }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  }

  
};

// Inserting to database checkboxes


// Select Unselect Checkbox

const handleCheckboxChange = (value) => {
  const rolename = document.getElementsByName("rolename")[0].value;
  const desc = document.getElementsByName("desc")[0].value;
  const authorization = value; // Value from the checkbox
  
  if (selectedCheckboxes.some(item => item.value === value)) {
    setSelectedCheckboxes(selectedCheckboxes.filter(item => item.value !== value));
  } else {
    setSelectedCheckboxes([...selectedCheckboxes, { value, rolename, desc, authorization }]);
  }
};

const handleSelectAll = () => {
  // Select all checkboxes
  const allCheckboxValues = [
    "Analytic Dashboard - Add",
    "Analytic Dashboard - Edit",
    "Analytic Dashboard - Delete",
    "Analytic Dashboard - View",
    "Master List - Add",
    "Master List - Edit",
    "Master List - Delete",
    "Master List - View",
    "Employee Position - Add",
    "Employee Position - Edit",
    "Employee Position - Delete",
    "Employee Position - View",
    "User Access Role - Add",
    "User Access Role - Edit",
    "User Access Role - Delete",
    "User Access Role - View",
    "Product List - Add",
    "Product List - Edit",
    "Product List - Delete",
    "Product List - View",
    "Product Categories - Add",
    "Product Categories - Edit",
    "Product Categories - Delete",
    "Product Categories - View",
    "Bin Location - Add",
    "Bin Location - Edit",
    "Bin Location - Delete",
    "Bin Location - View",
    "Cost Centre - Add",
    "Cost Centre - Edit",
    "Cost Centre - Delete",
    "Cost Centre - View",
    "Supplier - Add",
    "Supplier - Edit",
    "Supplier - Delete",
    "Supplier - View",
    "Asset Monitoring - Add",
    "Asset Monitoring - Edit",
    "Asset Monitoring - Delete",
    "Asset Monitoring - View",
    "Item Master Data - Add",
    "Item Master Data - Edit",
    "Item Master Data - Delete",
    "Item Master Data - View",
    "Inventory Type - Add",
    "Inventory Type - Edit",
    "Inventory Type - Delete",
    "Inventory Type - View",
    "PO Transaction - Add",
    "PO Transaction - Edit",
    "PO Transaction - Delete",
    "PO Transaction - View",
    "Invoice - Add",
    "Invoice - Edit",
    "Invoice - Delete",
    "Invoice - View",
    "Warehouse Master List - Add",
    "Warehouse Master List - Edit",
    "Warehouse Master List - Delete",
    "Warehouse Master List - View",
    "Quality Check - Add",
    "Quality Check - Edit",
    "Quality Check - Delete",
    "Quality Check - View",
    "Receiving - Add",
    "Receiving - Edit",
    "Receiving - Delete",
    "Receiving - View",
    "Stock Management - Add",
    "Stock Management - Edit",
    "Stock Management - Delete",
    "Stock Management - View",
    "Asset List - Add",
    "Asset List - Edit",
    "Asset List - Delete",
    "Asset List - View",
    "Activity Log - Add",
    "Activity Log - Edit",
    "Activity Log - Delete",
    "Activity Log - View",
    "Audit Trail - Add",
    "Audit Trail - Edit",
    "Audit Trail - Delete",
    "Audit Trail - View"
  ];
  

  const updatedCheckboxes = allCheckboxValues.map(value => ({
    value,
    rolename: document.getElementsByName("rolename")[0].value,
    desc: document.getElementsByName("desc")[0].value,
    authorization: value,
  }));

  setSelectedCheckboxes(updatedCheckboxes);
};

const handleUnselectAll = () => {
  // Unselect all checkboxes
  setSelectedCheckboxes([]);
};




  return (
    <div className="main-of-containers">
      {/* <div className="left-of-main-containers">
        <Sidebar />
      </div> */}
        <div className="right-of-main-containers">
          <div className="right-body-contents">

              <div className="settings-search-master">

                  <div className="dropdown-and-iconics">
                      <div className="dropdown-side">
                          <div className="dropdownsss">
                              <select name="" id="">
                                <option value="All">All</option>
                              </select>
                          </div>
                          <div className="searcher-side">
                              <div style={{ position: "relative" }}>
                                <input
                                  type="search"
                                  placeholder="Search"
                                  className="searchInput"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                ></input>
                                <MagnifyingGlass
                                  size={23}
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "0.9rem",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                  }}
                                />
                              </div>
                          </div>

                          <div className="search-buttons">
                            <button>Search</button>
                          </div>
                      </div>
                      <div className="iconic-side">
                            <div className="gearsides">
                              <Gear size={35}/>
                            </div>
                            <div className="bellsides">
                              <Bell size={35}/>
                            </div>
                            <div className="usersides">
                              <UserCircle size={35}/>
                          </div>
                      </div>
                  </div>

                </div>

                <div className="Employeetext-button">
                    <div className="employee-and-button">
                      <div className="emp-text-side">
                          <p>Role Profile</p>
                      </div>

                      <div className="button-create-side">
                        <div className="Buttonmodal-new">
                          </div>
                      </div>
                    </div>
                </div>

                <div className="sortingplacess">
                    <div className="sortingboxess">
                      {/* <span>Show</span>
                      <select name="" id="">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="All">All</option>
                      </select>
                      <span>Entries</span> */}
                  </div>
                </div>

                <div className="table-containss">
                    <div className="main-of-all-tables">
                    <form className='w-100 mt-3' onSubmit={handleSubmit}>
                            
                            <Form style={{ marginLeft: '50px' }}>
                              <div className="row">
                                <div className="col-6">
                                  <Form.Group controlId="exampleForm.ControlInput1">
                                    <Form.Label style={{ fontSize: '20px' }}>Name: </Form.Label>
                                    <Form.Control type="text" placeholder="Enter Role Name" style={{height: '40px', fontSize: '15px', width: '500px'}}
                                      name="rolename"
                                      required
                                      maxLength={50}
                                      onInput={handleRoleNameInput}/>
                                  </Form.Group>
                                  <div className="invalid-feedback">Role Name Must not have Number and Special Characters</div>
                                </div>
                                <div className="col-6">
                                  <Form.Group controlId="exampleForm.ControlInput2">
                                    <Form.Label style={{ fontSize: '20px' }}>Description: </Form.Label>
                                    <Form.Control type="text" placeholder="Description ..." style={{height: '40px', fontSize: '15px',  width: '500px'}} 
                                    maxLength={200} className="form-control" name="desc" required />
                                  </Form.Group>
                                </div>
                              </div>
                            </Form>

                            <div className="d-flex"  style={{ marginLeft: '50px' }}>
                              <Button variant="warning" style={{ width: '100px', marginRight: '10px', fontSize: '1.5rem' }} onClick={handleSelectAll}>
                                Select All
                              </Button>
                              <Button variant="warning" style={{ width: '100px', fontSize: '1.5rem' }} onClick={handleUnselectAll}>
                                Unselect All
                              </Button>
                            </div>
                            
                          
                            

                <div className='w-100 mt-1' style={{ marginLeft: '50px' }}>
                  <table class="table">
                    <thead>
                      <tr>
                        <th style={{fontSize: 15}}>Module</th>
                        <th style={{fontSize: 15}}>Add</th>
                        <th style={{fontSize: 15}}>Edit</th>
                        <th style={{fontSize: 15}}>Delete</th>
                        <th style={{fontSize: 15}}>View</th>
                      </tr>
                    </thead>
                    <tbody>
                      <td className='role-head'><h3 className='role-head'>Dashboard</h3></td>
                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>Analytic Dashboard</td>
                        </td>
                        <td>
                          <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Analytic Dashboard - Add"
                                name="vehicle1"
                                value="Analytic Dashboard - Add"
                                checked={selectedCheckboxes.some(item => item.value === 'Analytic Dashboard - Add')}
                                onChange={() => handleCheckboxChange('Analytic Dashboard - Add')}
                                
                              />
                                <label className='p-3' htmlFor="Analytic Dashboard - Add"></label>

                            </div>
                          </td>
                          <td>
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Analytic Dashboard - Edit"
                                name="vehicle1"
                                value="Analytic Dashboard - Edit"
                                checked={selectedCheckboxes.some(item => item.value === 'Analytic Dashboard - Edit')}
                                onChange={() => handleCheckboxChange('Analytic Dashboard - Edit')}
                                
                              />
                                <label className='p-3' htmlFor="Analytic Dashboard - Edit"></label>

                            </div>
                          </td>

                          <td>
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Analytic Dashboard - Delete"
                                name="vehicle1"
                                value="Analytic Dashboard - Delete"
                                checked={selectedCheckboxes.some(item => item.value === 'Analytic Dashboard - Delete')}
                                onChange={() => handleCheckboxChange('Analytic Dashboard - Delete')}
                              />
                                <label className='p-3' htmlFor="Analytic Dashboard - Delete"></label>

                            </div>
                          </td>

                          <td>
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Analytic Dashboard - View"
                                name="vehicle1"
                                value="Analytic Dashboard - View"
                                checked={selectedCheckboxes.some(item => item.value === 'Analytic Dashboard - View')}
                                onChange={() => handleCheckboxChange('Analytic Dashboard - View')}
                              />
                                <label className='p-3' htmlFor="Analytic Dashboard - View"></label>
                            </div>
                                                    
                          </td>
                      </tr>

                      {/* --------------------------------------BREAK ------------------------------*/}

                      <td><h3 className='role-head'>Administrator</h3></td>
                      <tr>
                      <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>Master List</td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Master List - Add"
                              name="vehicle1"
                              value="Master List - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Master List - Add')}
                              onChange={() => handleCheckboxChange('Master List - Add')}
                            />
                              <label className='p-3' htmlFor="Master List - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Master List - Edit"
                              name="vehicle1"
                              value="Master List - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Master List - Edit')}
                              onChange={() => handleCheckboxChange('Master List - Edit')}
                            />
                              <label className='p-3' htmlFor="Master List - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Master List - Delete"
                              name="vehicle1"
                              value="Master List - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Master List - Delete')}
                              onChange={() => handleCheckboxChange('Master List - Delete')}
                            />
                              <label className='p-3' htmlFor="Master List - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Master List - View"
                              name="vehicle1"
                              value="Master List - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Master List - View')}
                              onChange={() => handleCheckboxChange('Master List - View')}
                            />
                              <label className='p-3' htmlFor="Master List - View"></label>

                          </div>
                        </td>          
                      </tr>

                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>
                            Employee Position
                          </td> 
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Employee Position - Add"
                              name="vehicle1"
                              value="Employee Position - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Employee Position - Add')}
                              onChange={() => handleCheckboxChange('Employee Position - Add')}
                            />
                              <label className='p-3' htmlFor="Employee Position - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Employee Position - Edit"
                              name="vehicle1"
                              value="Employee Position - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Employee Position - Edit')}
                              onChange={() => handleCheckboxChange('Employee Position - Edit')}
                            />
                              <label className='p-3' htmlFor="Employee Position - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Employee Position - Delete"
                              name="vehicle1"
                              value="Employee Position - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Employee Position - Delete')}
                              onChange={() => handleCheckboxChange('Employee Position - Delete')}
                            />
                              <label className='p-3' htmlFor="Employee Position - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Employee Position - View"
                              name="vehicle1"
                              value="Employee Position - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Employee Position - View')}
                              onChange={() => handleCheckboxChange('Employee Position - View')}
                            />
                              <label className='p-3' htmlFor="Employee Position - View"></label>

                          </div>
                        </td>
                      </tr>


                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>
                            User Access Role
                          </td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="User Access Role - Add"
                              name="vehicle1"
                              value="User Access Role - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'User Access Role - Add')}
                              onChange={() => handleCheckboxChange('User Access Role - Add')}
                            />
                              <label className='p-3' htmlFor="User Access Role - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="User Access Role - Edit"
                              name="vehicle1"
                              value="User Access Role - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'User Access Role - Edit')}
                              onChange={() => handleCheckboxChange('User Access Role - Edit')}
                            />
                              <label className='p-3' htmlFor="User Access Role - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="User Access Role - Delete"
                              name="vehicle1"
                              value="User Access Role - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'User Access Role - Delete')}
                              onChange={() => handleCheckboxChange('User Access Role - Delete')}
                            />
                              <label className='p-3' htmlFor="User Access Role - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="User Access Role - View"
                              name="vehicle1"
                              value="User Access Role - View"
                              checked={selectedCheckboxes.some(item => item.value === 'User Access Role - View')}
                              onChange={() => handleCheckboxChange('User Access Role - View')}
                            />
                              <label className='p-3' htmlFor="User Access Role - View"></label>

                          </div>
                        </td>
                      </tr>

                      <tr>
                          <td>
                            <td className='role' style={{ border: '0px', fontSize: '15px'}}>
                              Product List
                            </td>

                          </td>

                          <td> 
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Product List - Add"
                                name="vehicle1"
                                value="Product List - Add"
                                checked={selectedCheckboxes.some(item => item.value === 'Product List - Add')}
                                onChange={() => handleCheckboxChange('Product List - Add')}
                              />
                                <label className='p-3' htmlFor="Product List - Add"></label>

                            </div>
                          </td>


                          <td> 
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Product List - Edit"
                                name="vehicle1"
                                value="Product List - Edit"
                                checked={selectedCheckboxes.some(item => item.value === 'Product List - Edit')}
                                onChange={() => handleCheckboxChange('Product List - Edit')}
                              />
                                <label className='p-3' htmlFor="Product List - Edit"></label>

                            </div>
                          </td>

                          <td> 
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Product List - Delete"
                                name="vehicle1"
                                value="Product List - Delete"
                                checked={selectedCheckboxes.some(item => item.value === 'Product List - Delete')}
                                onChange={() => handleCheckboxChange('Product List - Delete')}
                              />
                                <label className='p-3' htmlFor="Product List - Delete"></label>

                            </div>
                          </td>

                          <td> 
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Product List - View"
                                name="vehicle1"
                                value="Product List - View"
                                checked={selectedCheckboxes.some(item => item.value === 'Product List - View')}
                                onChange={() => handleCheckboxChange('Product List - View')}
                              />
                                <label className='p-3' htmlFor="Product List - View"></label>

                            </div>
                          </td>
                      </tr>

                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>
                            Product Categories
                          </td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Product Categories - Add"
                              name="vehicle1"
                              value="Product Categories - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Product Categories - Add')}
                              onChange={() => handleCheckboxChange('Product Categories - Add')}
                            />
                              <label className='p-3' htmlFor="Product Categories - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Product Categories - Edit"
                              name="vehicle1"
                              value="Product Categories - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Product Categories - Edit')}
                              onChange={() => handleCheckboxChange('Product Categories - Edit')}
                            />
                              <label className='p-3' htmlFor="Product Categories - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Product Categories - Delete"
                              name="vehicle1"
                              value="Product Categories - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Product Categories - Delete')}
                              onChange={() => handleCheckboxChange('Product Categories - Delete')}
                            />
                              <label className='p-3' htmlFor="Product Categories - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Product Categories - View"
                              name="vehicle1"
                              value="Product Categories - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Product Categories - View')}
                              onChange={() => handleCheckboxChange('Product Categories - View')}
                            />
                              <label className='p-3' htmlFor="Product Categories - View"></label>

                          </div>
                        </td>
                      </tr>


                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>
                            Bin Location
                          </td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Bin Location - Add"
                              name="vehicle1"
                              value="Bin Location - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Bin Location - Add')}
                              onChange={() => handleCheckboxChange('Bin Location - Add')}
                            />
                              <label className='p-3' htmlFor="Bin Location - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Bin Location - Edit"
                              name="vehicle1"
                              value="Bin Location - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Bin Location - Edit')}
                              onChange={() => handleCheckboxChange('Bin Location - Edit')}
                            />
                              <label className='p-3' htmlFor="Bin Location - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Bin Location - Delete"
                              name="vehicle1"
                              value="Bin Location - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Bin Location - Delete')}
                              onChange={() => handleCheckboxChange('Bin Location - Delete')}
                            />
                              <label className='p-3' htmlFor="Bin Location - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Bin Location - View"
                              name="vehicle1"
                              value="Bin Location - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Bin Location - View')}
                              onChange={() => handleCheckboxChange('Bin Location - View')}
                            />
                              <label className='p-3' htmlFor="Bin Location - View"></label>

                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>
                            Cost Centre
                          </td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Cost Centre - Add"
                              name="vehicle1"
                              value="Cost Centre - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Cost Centre - Add')}
                              onChange={() => handleCheckboxChange('Cost Centre - Add')}
                            />
                              <label className='p-3' htmlFor="Cost Centre - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Cost Centre - Edit"
                              name="vehicle1"
                              value="Cost Centre - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Cost Centre - Edit')}
                              onChange={() => handleCheckboxChange('Cost Centre - Edit')}
                            />
                              <label className='p-3' htmlFor="Cost Centre - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Cost Centre - Delete"
                              name="vehicle1"
                              value="Cost Centre - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Cost Centre - Delete')}
                              onChange={() => handleCheckboxChange('Cost Centre - Delete')}
                            />
                              <label className='p-3' htmlFor="Cost Centre - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Cost Centre - View"
                              name="vehicle1"
                              value="Cost Centre - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Cost Centre - View')}
                              onChange={() => handleCheckboxChange('Cost Centre - View')}
                            />
                              <label className='p-3' htmlFor="Cost Centre - View"></label>

                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>
                            Supplier
                          </td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Supplier - Add"
                              name="vehicle1"
                              value="Supplier - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Supplier - Add')}
                              onChange={() => handleCheckboxChange('Supplier - Add')}
                            />
                              <label className='p-3' htmlFor="Supplier - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Supplier - Edit"
                              name="vehicle1"
                              value="Supplier - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Supplier - Edit')}
                              onChange={() => handleCheckboxChange('Supplier - Edit')}
                            />
                              <label className='p-3' htmlFor="Supplier - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Supplier - Delete"
                              name="vehicle1"
                              value="Supplier - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Supplier - Delete')}
                              onChange={() => handleCheckboxChange('Supplier - Delete')}
                            />
                              <label className='p-3' htmlFor="Supplier - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Supplier - View"
                              name="vehicle1"
                              value="Supplier - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Supplier - View')}
                              onChange={() => handleCheckboxChange('Supplier - View')}
                            />
                              <label className='p-3' htmlFor="Supplier - View"></label>

                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>
                            Asset Monitoring
                          </td>
                          
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Asset Monitoring - Add"
                              name="vehicle1"
                              value="Asset Monitoring - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Asset Monitoring - Add')}
                              onChange={() => handleCheckboxChange('Asset Monitoring - Add')}
                            />
                              <label className='p-3' htmlFor="Asset Monitoring - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Asset Monitoring - Edit"
                              name="vehicle1"
                              value="Asset Monitoring - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Asset Monitoring - Edit')}
                              onChange={() => handleCheckboxChange('Asset Monitoring - Edit')}
                            />
                              <label className='p-3' htmlFor="Asset Monitoring - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Asset Monitoring - Delete"
                              name="vehicle1"
                              value="Asset Monitoring - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Asset Monitoring - Delete')}
                              onChange={() => handleCheckboxChange('Asset Monitoring - Delete')}
                            />
                              <label className='p-3' htmlFor="Asset Monitoring - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Asset Monitoring - View"
                              name="vehicle1"
                              value="Asset Monitoring - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Asset Monitoring - View')}
                              onChange={() => handleCheckboxChange('Asset Monitoring - View')}
                            />
                              <label className='p-3' htmlFor="Asset Monitoring - View"></label>

                          </div>
                        </td>
                      </tr>

                      <td><h3 className='role-head'>Inventory</h3></td>
                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>Item Master Data</td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Item Master Data - Add"
                              name="vehicle1"
                              value="Item Master Data - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Item Master Data - Add')}
                              onChange={() => handleCheckboxChange('Item Master Data - Add')}
                            />
                              <label className='p-3' htmlFor="Item Master Data - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Item Master Data - Edit"
                              name="vehicle1"
                              value="Item Master Data - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Item Master Data - Edit')}
                              onChange={() => handleCheckboxChange('Item Master Data - Edit')}
                            />
                              <label className='p-3' htmlFor="Item Master Data - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Item Master Data - Delete"
                              name="vehicle1"
                              value="Item Master Data - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Item Master Data - Delete')}
                              onChange={() => handleCheckboxChange('Item Master Data - Delete')}
                            />
                              <label className='p-3' htmlFor="Item Master Data - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Item Master Data - View"
                              name="vehicle1"
                              value="Item Master Data - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Item Master Data - View')}
                              onChange={() => handleCheckboxChange('Item Master Data - View')}
                            />
                              <label className='p-3' htmlFor="Item Master Data - View"></label>

                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>
                            Inventory Type
                          </td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Inventory Type - Add"
                              name="vehicle1"
                              value="Inventory Type - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Inventory Type - Add')}
                              onChange={() => handleCheckboxChange('Inventory Type - Add')}
                            />
                              <label className='p-3' htmlFor="Inventory Type - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Inventory Type - Edit"
                              name="vehicle1"
                              value="Inventory Type - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Inventory Type - Edit')}
                              onChange={() => handleCheckboxChange('Inventory Type - Edit')}
                            />
                              <label className='p-3' htmlFor="Inventory Type - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Inventory Type - Delete"
                              name="vehicle1"
                              value="Inventory Type - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Inventory Type - Delete')}
                              onChange={() => handleCheckboxChange('Inventory Type - Delete')}
                            />
                              <label className='p-3' htmlFor="Inventory Type - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Inventory Type - View"
                              name="vehicle1"
                              value="Inventory Type - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Inventory Type - View')}
                              onChange={() => handleCheckboxChange('Inventory Type - View')}
                            />
                              <label className='p-3' htmlFor="Inventory Type - View"></label>

                          </div>
                        </td>
                      </tr>

                      <td><h3 className='role-head'>Purchase Order Interface</h3></td>
                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>
                            PO Transaction
                          </td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="PO Transaction - Add"
                              name="vehicle1"
                              value="PO Transaction - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'PO Transaction - Add')}
                              onChange={() => handleCheckboxChange('PO Transaction - Add')}
                            />
                              <label className='p-3' htmlFor="PO Transaction - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="PO Transaction - Edit"
                              name="vehicle1"
                              value="PO Transaction - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'PO Transaction - Edit')}
                              onChange={() => handleCheckboxChange('PO Transaction - Edit')}
                            />
                              <label className='p-3' htmlFor="PO Transaction - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="PO Transaction - Delete"
                              name="vehicle1"
                              value="PO Transaction - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'PO Transaction - Delete')}
                              onChange={() => handleCheckboxChange('PO Transaction - Delete')}
                            />
                              <label className='p-3' htmlFor="PO Transaction - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="PO Transaction - View"
                              name="vehicle1"
                              value="PO Transaction - View"
                              checked={selectedCheckboxes.some(item => item.value === 'PO Transaction - View')}
                              onChange={() => handleCheckboxChange('PO Transaction - View')}
                            />
                              <label className='p-3' htmlFor="PO Transaction - View"></label>

                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>Invoice</td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Invoice - Add"
                              name="vehicle1"
                              value="Invoice - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Invoice - Add')}
                              onChange={() => handleCheckboxChange('Invoice - Add')}
                            />
                              <label className='p-3' htmlFor="Invoice - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Invoice - Edit"
                              name="vehicle1"
                              value="Invoice - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Invoice - Edit')}
                              onChange={() => handleCheckboxChange('Invoice - Edit')}
                            />
                              <label className='p-3' htmlFor="Invoice - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Invoice - Delete"
                              name="vehicle1"
                              value="Invoice - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Invoice - Delete')}
                              onChange={() => handleCheckboxChange('Invoice - Delete')}
                            />
                              <label className='p-3' htmlFor="Invoice - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Invoice - View"
                              name="vehicle1"
                              value="Invoice - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Invoice - View')}
                              onChange={() => handleCheckboxChange('Invoice - View')}
                            />
                              <label className='p-3' htmlFor="Invoice - View"></label>

                          </div>
                        </td>
                      </tr>

                      <td><h3 className='role-head'>Warehouse</h3></td>
                      <tr>
                        <td> 
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>Warehouse Master List</td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Warehouse Master List - Add"
                              name="vehicle1"
                              value="Warehouse Master List - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Warehouse Master List - Add')}
                              onChange={() => handleCheckboxChange('Warehouse Master List - Add')}
                            />
                              <label className='p-3' htmlFor="Warehouse Master List - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Warehouse Master List - Edit"
                              name="vehicle1"
                              value="Warehouse Master List - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Warehouse Master List - Edit')}
                              onChange={() => handleCheckboxChange('Warehouse Master List - Edit')}
                            />
                              <label className='p-3' htmlFor="Warehouse Master List - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Warehouse Master List - Delete"
                              name="vehicle1"
                              value="Warehouse Master List - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Warehouse Master List - Delete')}
                              onChange={() => handleCheckboxChange('Warehouse Master List - Delete')}
                            />
                              <label className='p-3' htmlFor="Warehouse Master List - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Warehouse Master List - View"
                              name="vehicle1"
                              value="Warehouse Master List - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Warehouse Master List - View')}
                              onChange={() => handleCheckboxChange('Warehouse Master List - View')}
                            />
                              <label className='p-3' htmlFor="Warehouse Master List - View"></label>

                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>Quality Check</td>
                        </td>

                          <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Quality Check - Add"
                              name="vehicle1"
                              value="Quality Check - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Quality Check - Add')}
                              onChange={() => handleCheckboxChange('Quality Check - Add')}
                            />
                              <label className='p-3' htmlFor="Quality Check - Add"></label>

                          </div>
                          </td>


                          <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Quality Check - Edit"
                              name="vehicle1"
                              value="Quality Check - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Quality Check - Edit')}
                              onChange={() => handleCheckboxChange('Quality Check - Edit')}
                            />
                              <label className='p-3' htmlFor="Quality Check - Edit"></label>

                          </div>
                          </td>

                          <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Quality Check - Delete"
                              name="vehicle1"
                              value="Quality Check - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Quality Check - Delete')}
                              onChange={() => handleCheckboxChange('Quality Check - Delete')}
                            />
                              <label className='p-3' htmlFor="Quality Check - Delete"></label>

                          </div>
                          </td>

                          <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Quality Check - View"
                              name="vehicle1"
                              value="Quality Check - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Quality Check - View')}
                              onChange={() => handleCheckboxChange('Quality Check - View')}
                            />
                              <label className='p-3' htmlFor="Quality Check - View"></label>

                          </div>
                          </td>
                      </tr>

                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>Receiving</td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Receiving - Add"
                              name="vehicle1"
                              value="Receiving - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Receiving - Add')}
                              onChange={() => handleCheckboxChange('Receiving - Add')}
                            />
                              <label className='p-3' htmlFor="Receiving - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Receiving - Edit"
                              name="vehicle1"
                              value="Receiving - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Receiving - Edit')}
                              onChange={() => handleCheckboxChange('Receiving - Edit')}
                            />
                              <label className='p-3' htmlFor="Receiving - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Receiving - Delete"
                              name="vehicle1"
                              value="Receiving - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Receiving - Delete')}
                              onChange={() => handleCheckboxChange('Receiving - Delete')}
                            />
                              <label className='p-3' htmlFor="Receiving - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Receiving - View"
                              name="vehicle1"
                              value="Receiving - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Receiving - View')}
                              onChange={() => handleCheckboxChange('Receiving - View')}
                            />
                              <label className='p-3' htmlFor="Receiving - View"></label>

                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>Stock Management</td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Stock Management - Add"
                              name="vehicle1"
                              value="Stock Management - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Stock Management - Add')}
                              onChange={() => handleCheckboxChange('Stock Management - Add')}
                            />
                              <label className='p-3' htmlFor="Stock Management - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Stock Management - Edit"
                              name="vehicle1"
                              value="Stock Management - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Stock Management - Edit')}
                              onChange={() => handleCheckboxChange('Stock Management - Edit')}
                            />
                              <label className='p-3' htmlFor="Stock Management - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Stock Management - Delete"
                              name="vehicle1"
                              value="Stock Management - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Stock Management - Delete')}
                              onChange={() => handleCheckboxChange('Stock Management - Delete')}
                            />
                              <label className='p-3' htmlFor="Stock Management - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Stock Management - View"
                              name="vehicle1"
                              value="Stock Management - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Stock Management - View')}
                              onChange={() => handleCheckboxChange('Stock Management - View')}
                            />
                              <label className='p-3' htmlFor="Stock Management - View"></label>

                          </div>
                        </td>
                      </tr>

                      <td><h3 className='role-head'>Asset Monitoring</h3></td>
                      <tr>
                        <td>
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>
                            Asset List
                          </td>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Asset List - Add"
                              name="vehicle1"
                              value="Asset List - Add"
                              checked={selectedCheckboxes.some(item => item.value === 'Asset List - Add')}
                              onChange={() => handleCheckboxChange('Asset List - Add')}
                            />
                              <label className='p-3' htmlFor="Asset List - Add"></label>

                          </div>
                        </td>


                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Asset List - Edit"
                              name="vehicle1"
                              value="Asset List - Edit"
                              checked={selectedCheckboxes.some(item => item.value === 'Asset List - Edit')}
                              onChange={() => handleCheckboxChange('Asset List - Edit')}
                            />
                              <label className='p-3' htmlFor="Asset List - Edit"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Asset List - Delete"
                              name="vehicle1"
                              value="Asset List - Delete"
                              checked={selectedCheckboxes.some(item => item.value === 'Asset List - Delete')}
                              onChange={() => handleCheckboxChange('Asset List - Delete')}
                            />
                              <label className='p-3' htmlFor="Asset List - Delete"></label>

                          </div>
                        </td>

                        <td> 
                          <div className='input-group'>
                            <input
                              type="checkbox"
                              id="Asset List - View"
                              name="vehicle1"
                              value="Asset List - View"
                              checked={selectedCheckboxes.some(item => item.value === 'Asset List - View')}
                              onChange={() => handleCheckboxChange('Asset List - View')}
                            />
                              <label className='p-3' htmlFor="Asset List - View"></label>

                          </div>
                        </td>
                      </tr>

                      <td><h3 className='role-head'>Activity Module</h3></td>
                      <tr>
                        <td> 
                          <td className='role' style={{ border: '0px', fontSize: '15px'}}>Activity Log</td>
                        </td>

                            <td> 
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Activity Log - Add"
                                name="vehicle1"
                                value="Activity Log - Add"
                                checked={selectedCheckboxes.some(item => item.value === 'Activity Log - Add')}
                                onChange={() => handleCheckboxChange('Activity Log - Add')}
                              />
                                <label className='p-3' htmlFor="Activity Log - Add"></label>

                            </div>
                            </td>


                            <td> 
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Activity Log - Edit"
                                name="vehicle1"
                                value="Activity Log - Edit"
                                checked={selectedCheckboxes.some(item => item.value === 'Activity Log - Edit')}
                                onChange={() => handleCheckboxChange('Activity Log - Edit')}
                              />
                                <label className='p-3' htmlFor="Activity Log - Edit"></label>

                            </div>
                            </td>

                            <td> 
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Activity Log - Delete"
                                name="vehicle1"
                                value="Activity Log - Delete"
                                checked={selectedCheckboxes.some(item => item.value === 'Activity Log - Delete')}
                                onChange={() => handleCheckboxChange('Activity Log - Delete')}
                              />
                                <label className='p-3' htmlFor="Activity Log - Delete"></label>

                            </div>
                            </td>

                            <td> 
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Activity Log - View"
                                name="vehicle1"
                                value="Activity Log - View"
                                checked={selectedCheckboxes.some(item => item.value === 'Activity Log - View')}
                                onChange={() => handleCheckboxChange('Activity Log - View')}
                              />
                                <label className='p-3' htmlFor="Activity Log - View"></label>

                            </div>
                            </td>
                      </tr>

                      <tr>
                          <td>
                            <td className='role' style={{ border: '0px', fontSize: '15px'}}>Audit Trail</td>
                          </td>

                          <td> 
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Audit Trail - Add"
                                name="vehicle1"
                                value="Audit Trail - Add"
                                checked={selectedCheckboxes.some(item => item.value === 'Audit Trail - Add')}
                                onChange={() => handleCheckboxChange('Audit Trail - Add')}
                              />
                                <label className='p-3' htmlFor="Audit Trail - Add"></label>

                            </div>
                          </td>


                          <td> 
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Audit Trail - Edit"
                                name="vehicle1"
                                value="Audit Trail - Edit"
                                checked={selectedCheckboxes.some(item => item.value === 'Audit Trail - Edit')}
                                onChange={() => handleCheckboxChange('Audit Trail - Edit')}
                              />
                                <label className='p-3' htmlFor="Audit Trail - Edit"></label>

                            </div>
                          </td>

                          <td> 
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Audit Trail - Delete"
                                name="vehicle1"
                                value="Audit Trail - Delete"
                                checked={selectedCheckboxes.some(item => item.value === 'Audit Trail - Delete')}
                                onChange={() => handleCheckboxChange('Audit Trail - Delete')}
                              />
                                <label className='p-3' htmlFor="Audit Trail - Delete"></label>

                            </div>
                          </td>

                          <td> 
                            <div className='input-group'>
                              <input
                                type="checkbox"
                                id="Audit Trail - View"
                                name="vehicle1"
                                value="Audit Trail - View"
                                checked={selectedCheckboxes.some(item => item.value === 'Audit Trail - View')}
                                onChange={() => handleCheckboxChange('Audit Trail - View')}
                              />
                                <label className='p-1' htmlFor="Audit Trail - View"></label>

                            </div>
                          </td>
                      </tr>




                    
                    </tbody>
                  </table>

                  <div className='d-flex flex-row mt-4'>
                  <Row>
                    <Col>
                      <div>
                        <Link style={{ fontSize: '1.5rem' }} to="/userRole" className=' btn_saveCancel btn btn-danger align-right'>Back</Link>
                      </div>
                    </Col>
                    <Col>
                      <div >
                        <Button style={{ fontSize: '1.5rem' }} type="submit" className='btn_saveCancel' variant="warning"  disabled = {selectedCheckboxes.length === 0}>
                          Save
                        </Button>
                      </div>
                      
                    </Col>
                  </Row>
                  </div>           
                </div>    
</form>    
                    </div>
                </div>

          </div>
        </div>
    </div>  
    
  )
}

export default Create_role