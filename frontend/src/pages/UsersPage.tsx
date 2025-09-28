import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { userApi, User } from '../services/api';
import { useRole } from '../components/Layout';
import { convertUserFromBackend, convertUserForBackend } from '../utils/converters';

const UsersPage: React.FC = () => {
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Collaborator' as 'Admin' | 'Manager' | 'Collaborator',
    managerId: null as number | null
  });

  useEffect(() => {
    if (currentRole === 'Collaborator') {
      navigate('/');
      return;
    }
    loadUsers();
  }, [currentRole, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAllUsers();
      const usersWithStringRole = response.data.map(convertUserFromBackend);
      setUsers(usersWithStringRole);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId ?? null
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'Collaborator',
        managerId: null
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Collaborator',
      managerId: null
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = convertUserForBackend(formData);

      if (editingUser) {
        await userApi.updateUser(editingUser.id, userData as any);
      } else {
        await userApi.createUser(userData as any);
      }
      handleCloseModal();
      loadUsers();
    } catch (err) {
      setError('Erro ao salvar usuário');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await userApi.deleteUser(id);
        loadUsers();
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Erro ao excluir usuário';
        setError(errorMessage);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: any = {
      'Admin': 'danger',
      'Manager': 'primary',
      'Collaborator': 'info'
    };
    return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
  };

  const getManagerName = (managerId: number | null) => {
    if (!managerId) return '-';
    const manager = users.find(u => u.id === managerId);
    return manager ? manager.name : '-';
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const managers = users.filter(u => u.role === 'Manager' || u.role === 'Admin');

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    managers: users.filter(u => u.role === 'Manager').length,
    collaborators: users.filter(u => u.role === 'Collaborator').length
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestão de Usuários</h2>
        {currentRole === 'Admin' && (
          <Button variant="primary" onClick={() => handleShowModal()}>
            ➕ Novo Usuário
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estatísticas */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card shadow-sm text-center">
            <Card.Body>
              <h4 className="mb-2">{stats.total}</h4>
              <p className="text-muted mb-0">Total</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card shadow-sm text-center">
            <Card.Body>
              <h4 className="mb-2 text-danger">{stats.admins}</h4>
              <p className="text-muted mb-0">Admins</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card shadow-sm text-center">
            <Card.Body>
              <h4 className="mb-2 text-primary">{stats.managers}</h4>
              <p className="text-muted mb-0">Managers</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card shadow-sm text-center">
            <Card.Body>
              <h4 className="mb-2 text-info">{stats.collaborators}</h4>
              <p className="text-muted mb-0">Colaboradores</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Busca e Tabela */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0"
            />
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-container">
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Gerente</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                             style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{getManagerName(user.managerId ?? null)}</td>
                    <td className="text-center">
                      {currentRole === 'Admin' && (
                        <>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowModal(user)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            disabled={user.role === 'Admin'}
                            title={user.role === 'Admin' ? 'Não é permitido excluir o Admin' : 'Excluir'}
                          >
                            🗑
                          </Button>
                        </>
                      )}
                      {currentRole !== 'Admin' && (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted">Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Modal de Formulário */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            👤 {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Collaborator">Collaborator</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gerente</Form.Label>
                  <Form.Select
                    value={formData.managerId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      managerId: e.target.value ? parseInt(e.target.value) : null
                    })}
                  >
                    <option value="">Sem gerente</option>
                    {managers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;