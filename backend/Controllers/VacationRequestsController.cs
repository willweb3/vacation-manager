using Microsoft.AspNetCore.Mvc;
using VacationManager.Models;
using VacationManager.Services;

namespace VacationManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VacationRequestsController : ControllerBase
    {
        private readonly IVacationRequestService _vacationRequestService;

        public VacationRequestsController(IVacationRequestService vacationRequestService)
        {
            _vacationRequestService = vacationRequestService;
        }

        [HttpGet]
        public ActionResult<List<VacationRequest>> GetAllRequests()
        {
            return Ok(_vacationRequestService.GetAllRequests());
        }

        [HttpGet("{id}")]
        public ActionResult<VacationRequest> GetRequestById(int id)
        {
            var request = _vacationRequestService.GetRequestById(id);
            if (request == null)
                return NotFound();

            return Ok(request);
        }

        [HttpGet("user/{userId}")]
        public ActionResult<List<VacationRequest>> GetRequestsByUserId(int userId)
        {
            var requests = _vacationRequestService.GetRequestsByUserId(userId);
            return Ok(requests);
        }

        [HttpGet("manager/{managerId}")]
        public ActionResult<List<VacationRequest>> GetRequestsForManager(int managerId)
        {
            var requests = _vacationRequestService.GetRequestsForManager(managerId);
            return Ok(requests);
        }

        [HttpPost]
        public ActionResult<VacationRequest> CreateRequest([FromBody] VacationRequest request, [FromHeader(Name = "X-User-Id")] int? userId, [FromHeader(Name = "X-User-Role")] string? role)
        {
            var currentUserId = userId ?? 1;
            var currentUserRole = Enum.TryParse<UserRole>(role, out var parsedRole) ? parsedRole : UserRole.Admin;

            if (request.StartDate >= request.EndDate)
            {
                return BadRequest("End date must be after start date");
            }

            var createdRequest = _vacationRequestService.CreateRequest(request, currentUserId, currentUserRole);
            if (createdRequest == null)
            {
                return BadRequest("Unable to create request. Check for overlapping dates or permissions.");
            }

            return CreatedAtAction(nameof(GetRequestById), new { id = createdRequest.Id }, createdRequest);
        }

        [HttpPut("{id}")]
        public ActionResult<VacationRequest> UpdateRequest(int id, [FromBody] VacationRequest request, [FromHeader(Name = "X-User-Id")] int? userId, [FromHeader(Name = "X-User-Role")] string? role)
        {
            var currentUserId = userId ?? 1;
            var currentUserRole = Enum.TryParse<UserRole>(role, out var parsedRole) ? parsedRole : UserRole.Admin;

            if (request.StartDate >= request.EndDate)
            {
                return BadRequest("End date must be after start date");
            }

            var updatedRequest = _vacationRequestService.UpdateRequest(id, request, currentUserId, currentUserRole);
            if (updatedRequest == null)
            {
                return BadRequest("Unable to update request. Check for overlapping dates or permissions.");
            }

            return Ok(updatedRequest);
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteRequest(int id, [FromHeader(Name = "X-User-Id")] int? userId, [FromHeader(Name = "X-User-Role")] string? role)
        {
            var currentUserId = userId ?? 1;
            var currentUserRole = Enum.TryParse<UserRole>(role, out var parsedRole) ? parsedRole : UserRole.Admin;

            var result = _vacationRequestService.DeleteRequest(id, currentUserId, currentUserRole);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPost("{id}/approve")]
        public ActionResult<VacationRequest> ApproveRequest(int id, [FromHeader(Name = "X-User-Id")] int? userId, [FromHeader(Name = "X-User-Role")] string? role)
        {
            var currentUserId = userId ?? 1;
            var currentUserRole = Enum.TryParse<UserRole>(role, out var parsedRole) ? parsedRole : UserRole.Admin;

            var approvedRequest = _vacationRequestService.ApproveRequest(id, currentUserId, currentUserRole);
            if (approvedRequest == null)
            {
                return BadRequest("Unable to approve request. Check permissions.");
            }

            return Ok(approvedRequest);
        }

        [HttpPost("{id}/reject")]
        public ActionResult<VacationRequest> RejectRequest(int id, [FromHeader(Name = "X-User-Id")] int? userId, [FromHeader(Name = "X-User-Role")] string? role)
        {
            var currentUserId = userId ?? 1;
            var currentUserRole = Enum.TryParse<UserRole>(role, out var parsedRole) ? parsedRole : UserRole.Admin;

            var rejectedRequest = _vacationRequestService.RejectRequest(id, currentUserId, currentUserRole);
            if (rejectedRequest == null)
            {
                return BadRequest("Unable to reject request. Check permissions.");
            }

            return Ok(rejectedRequest);
        }

        [HttpGet("{userId}/check-overlap")]
        public ActionResult<bool> CheckOverlap(int userId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int? excludeRequestId)
        {
            var hasOverlap = _vacationRequestService.HasOverlappingRequests(userId, startDate, endDate, excludeRequestId);
            return Ok(new { hasOverlap });
        }
    }
}