import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidenav, Nav, Toggle } from 'rsuite';
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import FileTextIcon from '@rsuite/icons/legacy/FileText';
import GearCircleIcon from '@rsuite/icons/legacy/GearCircle';
import 'rsuite/dist/rsuite.min.css';

export default function SidebarLayout() {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    if (location.pathname.includes('/dashboard')) setActiveKey('1');
    else if (location.pathname.includes('/form')) setActiveKey('2');
    else if (location.pathname.includes('/settings')) setActiveKey('3');
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: 240 }}>
        <Toggle
          onChange={setExpanded}
          checked={expanded}
          checkedChildren="Expand"
          unCheckedChildren="Collapse"
          style={{ margin: 10 }}
        />
        <Sidenav expanded={expanded}>
          <Sidenav.Body>
            <Nav activeKey={activeKey} onSelect={setActiveKey}>
              <Nav.Item eventKey="1" icon={<DashboardIcon />} as={Link} to="/dashboard">
                Dashboard
              </Nav.Item>

              <Nav.Menu eventKey="2" title="Forms" icon={<FileTextIcon />}>
                <Nav.Item as={Link} to="/form/travel">Travel</Nav.Item>
                <Nav.Item as={Link} to="/form/property">Property</Nav.Item>
                <Nav.Item as={Link} to="/form/business">Business</Nav.Item>
              </Nav.Menu>

              <Nav.Item eventKey="3" icon={<GearCircleIcon />} as={Link} to="/settings">
                Settings
              </Nav.Item>
            </Nav>
          </Sidenav.Body>
        </Sidenav>
      </div>

      <div style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </div>
    </div>
  );
}
