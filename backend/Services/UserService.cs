using Microsoft.EntityFrameworkCore;
using VacationManager.Data;
using VacationManager.Models;

namespace VacationManager.Services
{
    public interface IUserService
    {
        List<User> GetAllUsers();
        User? GetUserById(int id);
        User CreateUser(User user);
        User? UpdateUser(int id, User user);
        bool DeleteUser(int id);
        List<User> GetUsersByManagerId(int managerId);
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public List<User> GetAllUsers()
        {
            return _context.Users.ToList();
        }

        public User? GetUserById(int id)
        {
            return _context.Users.FirstOrDefault(u => u.Id == id);
        }

        public User CreateUser(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
            return user;
        }

        public User? UpdateUser(int id, User user)
        {
            var existingUser = _context.Users.FirstOrDefault(u => u.Id == id);
            if (existingUser == null) return null;

            existingUser.Name = user.Name;
            existingUser.Email = user.Email;
            existingUser.Role = user.Role;
            existingUser.ManagerId = user.ManagerId;

            _context.SaveChanges();
            return existingUser;
        }

        public bool DeleteUser(int id)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null) return false;

            if (user.Role == UserRole.Admin)
            {
                throw new InvalidOperationException("Não é permitido excluir o usuário Admin");
            }

            _context.Users.Remove(user);
            _context.SaveChanges();
            return true;
        }

        public List<User> GetUsersByManagerId(int managerId)
        {
            return _context.Users.Where(u => u.ManagerId == managerId).ToList();
        }
    }
}