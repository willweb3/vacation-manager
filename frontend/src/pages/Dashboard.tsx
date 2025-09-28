import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  ProgressBar,
  Alert,
} from "react-bootstrap";
import {
  userApi,
  vacationRequestApi,
  User,
  VacationRequest,
} from "../services/api";
import { useRole } from "../components/Layout";
import { convertUserFromBackend, convertRequestFromBackend } from "../utils/converters";

const Dashboard: React.FC = () => {
  const { currentUser, currentRole } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [currentUser, currentRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, requestsResponse] = await Promise.all([
        userApi.getAllUsers(),
        vacationRequestApi.getAllRequests(),
      ]);

      const usersWithStringRole = usersResponse.data.map(convertUserFromBackend);
      const requestsWithStringStatus = requestsResponse.data.map(convertRequestFromBackend);

      let filteredUsers = usersWithStringRole;
      let filteredRequests = requestsWithStringStatus;

      if (currentRole === 'Collaborator') {
        filteredUsers = usersWithStringRole.filter(u => u.id === currentUser.id);
        filteredRequests = requestsWithStringStatus.filter(r => r.userId === currentUser.id);
      } else if (currentRole === 'Manager') {
        const managerId = currentUser.id;
        filteredUsers = usersWithStringRole.filter(u =>
          u.id === managerId || u.managerId === managerId
        );
        const teamUserIds = filteredUsers.map(u => u.id);
        filteredRequests = requestsWithStringStatus.filter(r =>
          teamUserIds.includes(r.userId)
        );
      }

      setUsers(filteredUsers);
      setRequests(filteredRequests);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar dados. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalUsers: users.length,
    admins: users.filter((u) => u.role === "Admin").length,
    managers: users.filter((u) => u.role === "Manager").length,
    collaborators: users.filter((u) => u.role === "Collaborator").length,
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === "Pending").length,
    approvedRequests: requests.filter((r) => r.status === "Approved").length,
    rejectedRequests: requests.filter((r) => r.status === "Rejected").length,
  };

  const activeVacations = requests.filter((r) => {
    if (r.status !== "Approved") return false;
    const today = new Date();
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    return today >= start && today <= end;
  });

  const upcomingVacations = requests
    .filter((r) => {
      if (r.status !== "Approved") return false;
      const today = new Date();
      const start = new Date(r.startDate);
      return start > today;
    })
    .slice(0, 5);

  const pendingRequestsList = requests
    .filter((r) => {
      if (r.status !== "Pending") return false;

      if (currentRole === 'Manager') {
        if (r.userId === currentUser.id) return true;

        const user = users.find(u => u.id === r.userId);
        return user && user.managerId === currentUser.id;
      }
      return true;
    })
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    const variants: any = {
      Pending: "warning",
      Approved: "success",
      Rejected: "danger",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown";
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

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        {error}
      </Alert>
    );
  }

  return (
    <div className="dashboard py-3">
      {/* Estatísticas Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="stat-card shadow-sm">
            <Card.Body>
              <div>
                <div>
                  <h3 className="mb-0">{stats.totalUsers}</h3>
                  <p className="text-muted mb-0">Total Usuários</p>
                  <small className="text-muted">
                    {stats.admins} Admin • {stats.managers} Manager •{" "}
                    {stats.collaborators} Colab
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card shadow-sm">
            <Card.Body>
              <div>
                <div>
                  <h3 className="mb-0">{stats.totalRequests}</h3>
                  <p className="text-muted mb-0">Total Pedidos</p>
                  <small className="text-muted">
                    {activeVacations.length} em andamento
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card shadow-sm">
            <Card.Body>
              <div>
                <div>
                  <h3 className="mb-0">{stats.pendingRequests}</h3>
                  <p className="text-muted mb-0">Pendentes</p>
                  <small className="text-muted">Aguardando aprovação</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card shadow-sm">
            <Card.Body>
              <div>
                <div>
                  <h3 className="mb-0">{stats.approvedRequests}</h3>
                  <p className="text-muted mb-0">Aprovados</p>
                  <small className="text-muted">
                    {stats.rejectedRequests} rejeitados
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Pedidos Pendentes */}
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Pedidos Pendentes</h5>
            </Card.Header>
            <Card.Body>
              {pendingRequestsList.length === 0 ? (
                <p className="text-muted text-center">Nenhum pedido pendente</p>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Colaborador</th>
                      <th>Período</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequestsList.map((request) => (
                      <tr key={request.id}>
                        <td>{getUserName(request.userId)}</td>
                        <td>
                          <small>
                            {new Date(request.startDate).toLocaleDateString()} -
                            {new Date(request.endDate).toLocaleDateString()}
                          </small>
                        </td>
                        <td>{getStatusBadge(request.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Próximas Férias */}
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Próximas Férias</h5>
            </Card.Header>
            <Card.Body>
              {upcomingVacations.length === 0 ? (
                <p className="text-muted text-center">
                  Nenhuma férias programada
                </p>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Colaborador</th>
                      <th>Início</th>
                      <th>Dias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingVacations.map((request) => {
                      const start = new Date(request.startDate);
                      const end = new Date(request.endDate);
                      const days = Math.ceil(
                        (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
                      );

                      return (
                        <tr key={request.id}>
                          <td>{getUserName(request.userId)}</td>
                          <td>{start.toLocaleDateString()}</td>
                          <td>
                            <Badge bg="info">{days} dias</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Colaboradores de Férias */}
      {activeVacations.length > 0 && (
        <Card className="shadow-sm">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">Colaboradores em Férias Agora</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {activeVacations.map((request) => {
                const user = users.find((u) => u.id === request.userId);
                const end = new Date(request.endDate);
                const today = new Date();
                const daysLeft = Math.ceil(
                  (end.getTime() - today.getTime()) / (1000 * 3600 * 24)
                );

                return (
                  <Col md={4} key={request.id} className="mb-3">
                    <Card className="border-success">
                      <Card.Body>
                        <h6>{user?.name}</h6>
                        <small className="text-muted">{user?.email}</small>
                        <p className="mb-1 mt-2">
                          <small>Retorna em: {end.toLocaleDateString()}</small>
                        </p>
                        <Badge bg="success">{daysLeft} dias restantes</Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
