using VacationManager.Models;

namespace VacationManager.Services
{
    public static class DataStore
    {
        public static List<User> Users { get; set; } = new List<User>
        {
            new User { Id = 1, Name = "Admin User", Email = "admin@company.com", Role = UserRole.Admin, ManagerId = null },
            new User { Id = 2, Name = "Manager One", Email = "manager1@company.com", Role = UserRole.Manager, ManagerId = 1 },
            new User { Id = 3, Name = "Manager Two", Email = "manager2@company.com", Role = UserRole.Manager, ManagerId = 1 },
            new User { Id = 4, Name = "John Doe", Email = "john@company.com", Role = UserRole.Collaborator, ManagerId = 2 },
            new User { Id = 5, Name = "Jane Smith", Email = "jane@company.com", Role = UserRole.Collaborator, ManagerId = 2 },
            new User { Id = 6, Name = "Bob Wilson", Email = "bob@company.com", Role = UserRole.Collaborator, ManagerId = 3 },
            new User { Id = 7, Name = "Alice Brown", Email = "alice@company.com", Role = UserRole.Collaborator, ManagerId = 3 }
        };

        public static List<VacationRequest> VacationRequests { get; set; } = new List<VacationRequest>
        {
            new VacationRequest
            {
                Id = 1,
                UserId = 4,
                StartDate = DateTime.Now.AddDays(10),
                EndDate = DateTime.Now.AddDays(15),
                Status = RequestStatus.Pending,
                Description = "Summer vacation"
            },
            new VacationRequest
            {
                Id = 2,
                UserId = 5,
                StartDate = DateTime.Now.AddDays(20),
                EndDate = DateTime.Now.AddDays(25),
                Status = RequestStatus.Approved,
                Description = "Family trip"
            }
        };
    }
}