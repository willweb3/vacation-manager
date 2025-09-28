import React, { useState, useEffect, createContext, useContext } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Container, Row, Col, Nav, Button, Form } from "react-bootstrap";
import { userApi, User, setAuthHeaders } from "../services/api";
import { convertUserFromBackend, UserRole as ConvertedUserRole } from "../utils/converters";
import "./Layout.css";

export type UserRole = 'Admin' | 'Manager' | 'Collaborator';

interface CurrentUser {
  id: number;
  name: string;
  role: UserRole;
}

interface RoleContextType {
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  currentRole: UserRole;
}

const RoleContext = createContext<RoleContextType>({
  currentUser: { id: 1, name: 'Admin User', role: 'Admin' },
  setCurrentUser: () => {},
  currentRole: 'Admin'
});

export const useRole = () => useContext(RoleContext);

const Layout: React.FC = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });
  const [availableUsers, setAvailableUsers] = useState<CurrentUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    const savedUserId = localStorage.getItem("currentUserId");
    const defaultUser = { id: 1, name: 'Admin User', role: 'Admin' as UserRole };
    if (savedUserId) {
      return defaultUser;
    }
    return defaultUser;
  });

  const currentRole = currentUser.role;

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userApi.getAllUsers();
        const users = response.data.map((user: any) => {
          const converted = convertUserFromBackend(user);
          return {
            id: converted.id,
            name: converted.name,
            role: converted.role
          };
        });
        setAvailableUsers(users);

        const savedUserId = localStorage.getItem("currentUserId");
        if (savedUserId) {
          const savedUser = users.find((u: CurrentUser) => u.id === parseInt(savedUserId));
          if (savedUser) {
            setCurrentUser(savedUser);
          }
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("currentUserId", currentUser.id.toString());
    setAuthHeaders(currentUser.id, currentUser.role);
  }, [currentUser]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair do sistema?")) {
      alert("Esta funcionalidade ainda não foi implementada :)");
    }
  };

  const menuItems = [
    { path: "/", label: "Dashboard" },
    { path: "/users", label: "Usuários", roles: ['Admin', 'Manager'] as UserRole[] },
    { path: "/vacations", label: "Férias" },
  ].filter(item => !item.roles || item.roles.includes(currentUser.role));

  return (
    <RoleContext.Provider value={{ currentUser, setCurrentUser, currentRole }}>
      <div className="app-layout">
        {/* Sidebar */}
        <div className="sidebar bg-dark">
          <div className="sidebar-header">
            <h4 className="text-white mb-0">Vacation Manager</h4>
          </div>

          <Nav className="flex-column sidebar-nav">
            {menuItems.map((item) => (
              <Nav.Link
                key={item.path}
                as={Link}
                to={item.path}
                className={`sidebar-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <div className="sidebar-footer">
            <Nav.Link className="sidebar-link text-muted" onClick={handleLogout}>
              Sair
            </Nav.Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <div className="app-header bg-white shadow-sm">
            <Container fluid>
              <Row className="align-items-center py-3">
                <Col>
                  <h5 className="mb-0">
                    {menuItems.find((item) => item.path === location.pathname)
                      ?.label || "Dashboard"}
                  </h5>
                </Col>
                <Col xs="auto" className="d-flex align-items-center gap-2">
                  <Form.Select
                    size="sm"
                    value={currentUser.id}
                    onChange={(e) => {
                      const user = availableUsers.find(u => u.id === parseInt(e.target.value));
                      if (user) setCurrentUser(user);
                    }}
                    style={{ width: 'auto' }}
                  >
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </Form.Select>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={toggleTheme}
                    className="d-flex align-items-center"
                  >
                    {darkMode ? "☀️" : "🌙"}
                  </Button>
                </Col>
              </Row>
            </Container>
          </div>

          {/* Page Content */}
          <div className="page-content">
            <Container fluid>
              <Outlet />
            </Container>
          </div>
        </div>
      </div>
    </RoleContext.Provider>
  );
};

export default Layout;
