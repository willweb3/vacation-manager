import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Modal, Form, Alert, Nav } from 'react-bootstrap';
import { userApi, vacationRequestApi, User, VacationRequest } from '../services/api';
import { useRole } from '../components/Layout';
import { convertUserFromBackend, convertRequestFromBackend } from '../utils/converters';

const VacationsPage: React.FC = () => {
  const { currentUser, currentRole } = useRole();
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: 1,
    startDate: '',
    endDate: '',
    description: ''
  });
  const [includeWeekends, setIncludeWeekends] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser, currentRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsResponse, usersResponse] = await Promise.all([
        vacationRequestApi.getAllRequests(),
        userApi.getAllUsers()
      ]);

      const requestsWithStringStatus = requestsResponse.data.map(convertRequestFromBackend);
      const usersWithStringRole = usersResponse.data.map(convertUserFromBackend);

      setRequests(requestsWithStringStatus);
      setUsers(usersWithStringRole);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = () => {
    setFormData({
      userId: currentRole === 'Collaborator' ? currentUser.id : currentUser.id,
      startDate: '',
      endDate: '',
      description: ''
    });
    setIncludeWeekends(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIncludeWeekends(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requestData = {
        userId: formData.userId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        description: formData.description
      };

      console.log('Enviando dados:', requestData);

      await vacationRequestApi.createRequest(requestData);
      handleCloseModal();
      loadData();
    } catch (err: any) {
      console.error('Erro completo:', err.response?.data);

      let errorMessage = 'Erro ao criar pedido';

      if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.response?.data) {
        if (err.response.data.errors) {
          const errors = err.response.data.errors;
          const errorMessages = [];

          for (const key in errors) {
            if (Array.isArray(errors[key])) {
              errorMessages.push(...errors[key]);
            } else {
              errorMessages.push(errors[key]);
            }
          }

          errorMessage = errorMessages.join('. ');
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }

      setError(errorMessage);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await vacationRequestApi.approveRequest(id);
      loadData();
    } catch (err) {
      setError('Erro ao aprovar pedido');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await vacationRequestApi.rejectRequest(id);
      loadData();
    } catch (err) {
      setError('Erro ao rejeitar pedido');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await vacationRequestApi.deleteRequest(id);
        loadData();
      } catch (err) {
        setError('Erro ao excluir pedido');
      }
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  const getUserEmail = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : '';
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      'Pending': 'warning',
      'Approved': 'success',
      'Rejected': 'danger'
    };
    const icons: any = {
      'Pending': '⏰',
      'Approved': '✅',
      'Rejected': '❌'
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {icons[status]} {status}
      </Badge>
    );
  };

  const calculateDays = (startDate: string, endDate: string, countWeekends: boolean = false) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (countWeekends) {
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
      return days;
    }

    let workDays = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return workDays;
  };

  const canManageUser = (userId: number): boolean => {
    if (currentRole === 'Admin') return true;
    if (currentRole === 'Manager') {
      const user = users.find(u => u.id === userId);
      return user ? user.managerId === currentUser.id : false;
    }
    return false;
  };

  const filteredRequests = requests.filter(request => {
    if (currentRole === 'Collaborator') {
      if (request.userId !== currentUser.id) return false;
    } else if (currentRole === 'Manager') {
    }

    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return request.status === 'Pending';
    if (activeTab === 'approved') return request.status === 'Approved';
    if (activeTab === 'rejected') return request.status === 'Rejected';
    return true;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    approved: requests.filter(r => r.status === 'Approved').length,
    rejected: requests.filter(r => r.status === 'Rejected').length
  };

  const checkConflict = (userId: number, startDate: string, endDate: string) => {
    return requests.some(r => {
      if (r.userId !== userId || r.status === 'Rejected') return false;
      const rStart = new Date(r.startDate);
      const rEnd = new Date(r.endDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return (start <= rEnd && end >= rStart);
    });
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
    <div className="vacations-page py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestão de Férias</h2>
        <Button variant="primary" onClick={handleShowModal}>
          ➕ Novo Pedido
        </Button>
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
              <p className="text-muted mb-0">Total Pedidos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card shadow-sm text-center">
            <Card.Body>
              <h4 className="mb-2 text-warning">{stats.pending}</h4>
              <p className="text-muted mb-0">Pendentes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card shadow-sm text-center">
            <Card.Body>
              <h4 className="mb-2 text-success">{stats.approved}</h4>
              <p className="text-muted mb-0">Aprovados</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card shadow-sm text-center">
            <Card.Body>
              <h4 className="mb-2 text-danger">{stats.rejected}</h4>
              <p className="text-muted mb-0">Rejeitados</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros e Tabela */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <Nav variant="pills" activeKey={activeTab} onSelect={(k) => setActiveTab(k as any)}>
            <Nav.Item>
              <Nav.Link eventKey="all">
                Todos ({stats.total})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="pending">
                ⏰ Pendentes ({stats.pending})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="approved">
                ✅ Aprovados ({stats.approved})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="rejected">
                ❌ Rejeitados ({stats.rejected})
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-container">
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Colaborador</th>
                  <th>Período</th>
                  <th>Dias</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(request => {
                  const hasConflict = checkConflict(
                    request.userId,
                    request.startDate,
                    request.endDate
                  );

                  return (
                    <tr key={request.id} className={hasConflict ? 'table-warning' : ''}>
                      <td>{request.id}</td>
                      <td>
                        <div>
                          <div className="fw-bold">{getUserName(request.userId)}</div>
                          <small className="text-muted">{getUserEmail(request.userId)}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          {new Date(request.startDate).toLocaleDateString()} -
                          {new Date(request.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <Badge bg="info">
                          {calculateDays(request.startDate, request.endDate)} dias
                        </Badge>
                      </td>
                      <td>{request.description}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td className="text-center">
                        {request.status === 'Pending' && canManageUser(request.userId) && (
                          <>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-1"
                              onClick={() => handleApprove(request.id)}
                              title="Aprovar"
                            >
                              ✓
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="me-1"
                              onClick={() => handleReject(request.id)}
                              title="Rejeitar"
                            >
                              ✗
                            </Button>
                          </>
                        )}
                        {(currentRole === 'Admin' ||
                          (currentRole === 'Collaborator' && request.userId === currentUser.id && request.status === 'Pending')) && (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleDelete(request.id)}
                            title="Excluir"
                          >
                            🗑
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {filteredRequests.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted">Nenhum pedido encontrado</p>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Modal de Formulário */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Novo Pedido de Férias
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Colaborador</Form.Label>
                  <Form.Select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
                    disabled={currentRole === 'Collaborator'}
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Início</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    onKeyDown={(e) => e.preventDefault()}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Fim</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    onKeyDown={(e) => e.preventDefault()}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Motivo do pedido de férias..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="includeWeekends"
                label="Incluir fins de semana no cálculo"
                checked={includeWeekends}
                onChange={(e) => setIncludeWeekends(e.target.checked)}
              />
            </Form.Group>

            {formData.startDate && formData.endDate && (
              <Alert variant="info">
                Total de dias {includeWeekends ? '(incluindo fins de semana)' : 'úteis'}: {calculateDays(formData.startDate, formData.endDate, includeWeekends)}
              </Alert>
            )}

            {formData.startDate && formData.endDate &&
             checkConflict(formData.userId, formData.startDate, formData.endDate) && (
              <Alert variant="warning">
                ⚠️ Atenção: Existe sobreposição com outro período de férias!
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Criar Pedido
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default VacationsPage;