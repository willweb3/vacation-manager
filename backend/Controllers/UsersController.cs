using Microsoft.AspNetCore.Mvc;
using VacationManager.Models;
using VacationManager.Services;

namespace VacationManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        private (int userId, UserRole role) GetCurrentUser()
        {
            var userIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
            var userRoleHeader = Request.Headers["X-User-Role"].FirstOrDefault();

            if (!int.TryParse(userIdHeader, out var userId))
                userId = 1;

            if (!Enum.TryParse<UserRole>(userRoleHeader, out var role))
                role = UserRole.Admin;

            return (userId, role);
        }

        [HttpGet]
        public ActionResult<List<User>> GetAllUsers()
        {
            return Ok(_userService.GetAllUsers());
        }

        [HttpGet("{id}")]
        public ActionResult<User> GetUserById(int id)
        {
            var user = _userService.GetUserById(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPost]
        public ActionResult<User> CreateUser([FromBody] User user)
        {
            var (currentUserId, currentRole) = GetCurrentUser();

            if (currentRole != UserRole.Admin)
            {
                return StatusCode(403, new { error = "Apenas administradores podem criar usuários" });
            }

            if (string.IsNullOrWhiteSpace(user.Name) || string.IsNullOrWhiteSpace(user.Email))
            {
                return BadRequest("Name and Email are required");
            }

            var createdUser = _userService.CreateUser(user);
            return CreatedAtAction(nameof(GetUserById), new { id = createdUser.Id }, createdUser);
        }

        [HttpPut("{id}")]
        public ActionResult<User> UpdateUser(int id, [FromBody] User user)
        {
            var (currentUserId, currentRole) = GetCurrentUser();

            if (currentRole != UserRole.Admin)
            {
                return StatusCode(403, new { error = "Apenas administradores podem editar usuários" });
            }

            if (string.IsNullOrWhiteSpace(user.Name) || string.IsNullOrWhiteSpace(user.Email))
            {
                return BadRequest("Name and Email are required");
            }

            var updatedUser = _userService.UpdateUser(id, user);
            if (updatedUser == null)
                return NotFound();

            return Ok(updatedUser);
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteUser(int id)
        {
            var (currentUserId, currentRole) = GetCurrentUser();

            if (currentRole != UserRole.Admin)
            {
                return StatusCode(403, new { error = "Apenas administradores podem excluir usuários" });
            }

            try
            {
                var result = _userService.DeleteUser(id);
                if (!result)
                    return NotFound();

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("manager/{managerId}")]
        public ActionResult<List<User>> GetUsersByManager(int managerId)
        {
            var users = _userService.GetUsersByManagerId(managerId);
            return Ok(users);
        }
    }
}