import React, { useState, useEffect } from 'react';
import '../../assets/global/style.css'
import '../styles/react-style.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import {
  SquaresFour,
  Users, 
  Archive,
  SignOut,
} from "@phosphor-icons/react";
import { Link, NavLink, useLocation } from 'react-router-dom';
// import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
// import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

function Sidebar() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [openAdministrator, setOpenAdministrator] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const toggleOff = () => {
    setOpenAdministrator(false);
    setOpenMenu(false);
  };

  const toggleAdministrator = () => {
    setOpenAdministrator(!openAdministrator);
  };

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  }

  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;

    if (path === '/dashboard') {
      setActiveMenu('DASHBOARD');
    } else if (path.startsWith('/masterList') || path.startsWith('/userRole') || path.startsWith('/createRole') || path.match(/^\/editRole\/(\d+)$/)) {
      setOpenAdministrator(true);
    } else if (path === '/reports') {
      setActiveMenu('REPORTS');
    }else if (path === '/menu'){
      setOpenMenu(true);
    }
  }, [location.pathname]);


  return (
    <div className="containers-of-sidebard">
      <div className='sidebar-main-content'>
        
        <div className="logo-head-sidebars">
        </div>

          <div className="spacefor-sidebar">
          </div>

          <List>
          <NavLink
            to='/dashboard'
            style={{ textDecoration: 'none', color: 'inherit' }}
            activeClassName="active"
          >
            <ListItem
              button
              className={`menu-item ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`} onClick={toggleOff}
            >
              <SquaresFour size={20} />
              <ListItemText primary="DASHBOARD" />
            </ListItem>
          </NavLink>

        <ListItem
          button
          className={`menu-item ${activeMenu === 'ADMINISTRATOR' ? 'active-hover' : ''}`}
          onClick={() => {
            setActiveMenu(activeMenu === 'ADMINISTRATOR' ? '' : 'ADMINISTRATOR');
            toggleAdministrator();
          }}
        >
          <Users size={20} />
          <ListItemText primary="ADMINISTRATOR" />
          {openAdministrator ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

          <Collapse in={openAdministrator}>
                <List component="div" disablePadding>
                <NavLink
                  to='/masterList'
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  activeClassName="active"
                >
                  <ListItem
                    button
                    className={`Employeesub-menu ${location.pathname === '/masterList' ? 'active' : ''}`}
                  >
                    <ListItemText primary="User Management" />
                  </ListItem>
                  </NavLink>

                  <NavLink
                  to='/userRole'
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  activeClassName="active"
                >
                  <ListItem
                    button
                    className={`Employeesub-menu ${location.pathname.startsWith('/userRole') || location.pathname.startsWith('/createRole') || location.pathname.startsWith('/editRole') ? 'active' : ''}`}
                  >
                    <ListItemText primary="Access Privilege" />
                  </ListItem>
                </NavLink>
                </List>
          </Collapse>

          <NavLink
            to='/extraOption'
            style={{ textDecoration: 'none', color: 'inherit' }}
            activeClassName="active"
          >
            <ListItem
              button
              className={`menu-item ${location.pathname === ('/extraOption') ? 'active' : ''}`} onClick={toggleOff}
            >
              <Archive size={20} />
              <ListItemText primary="Extra Options" />
            </ListItem>
          </NavLink>

          <NavLink
            to='/productCategory'
            style={{ textDecoration: 'none', color: 'inherit' }}
            activeClassName="active"
          >
            <ListItem
              button
              className={`menu-item ${location.pathname === ('/productCategory') ? 'active' : ''}`} onClick={toggleOff}
            >
              <Archive size={20} />
              <ListItemText primary="Category" />
            </ListItem>
          </NavLink>
        </List>
        </div>

          <div className="logout-container">
            <Link to={'/'} className='logout' onClick={() => { localStorage.removeItem('accessToken') }}>
              <SignOut size={20}/> Logout
                </Link>
            </div>  
        
    </div>
  );
}

export default Sidebar;
