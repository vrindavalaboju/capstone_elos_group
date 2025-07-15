import React, { useState, useEffect } from 'react';
import '/Users/maryzeno/Desktop/grad capstone/capstone_elos_group/client/src/assets/NavBar.css';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav } from 'rsuite';
import Home from '@rsuite/icons/legacy/Creative';
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import FileTextIcon from '@rsuite/icons/legacy/FileText';
import 'rsuite/dist/rsuite.min.css';
import logo from '../assets/images/logo.png'; 

export default function TopNavbar() {
  const location = useLocation();
  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    if (location.pathname.includes('/home')) setActiveKey('1');
    else if (location.pathname.includes('/dashboard')) setActiveKey('2');
    else if (location.pathname.includes('/form')) setActiveKey('3');
  }, [location.pathname]);

  return (
    <div className="navbar-wrapper">
      <Navbar className="custom-navbar">
        <Navbar.Brand className="navbar-logo">
          <img src={logo} alt="Logo" className="navbar-logo-image" />
          <span className="navbar-title">Elleos</span>
        </Navbar.Brand>
        <Nav activeKey={activeKey} onSelect={setActiveKey}>
          <Nav.Item eventKey="1" icon={<Home />} as={Link} to="/home">
            Home
          </Nav.Item>
          <Nav.Item eventKey="2" icon={<DashboardIcon />} as={Link} to="/dashboard">
            Dashboard
          </Nav.Item>
          <Nav.Menu eventKey="3" title="Forms" icon={<FileTextIcon />}>
            <Nav.Item as={Link} to="/form/travel">Travel</Nav.Item>
            <Nav.Item as={Link} to="/form/property">Property</Nav.Item>
            <Nav.Item as={Link} to="/form/business">Business</Nav.Item>
          </Nav.Menu>
        </Nav>
      </Navbar>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
