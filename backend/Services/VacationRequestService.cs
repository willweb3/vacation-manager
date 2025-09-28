using Microsoft.EntityFrameworkCore;
using VacationManager.Data;
using VacationManager.Models;

namespace VacationManager.Services
{
    public interface IVacationRequestService
    {
        List<VacationRequest> GetAllRequests();
        VacationRequest? GetRequestById(int id);
        List<VacationRequest> GetRequestsByUserId(int userId);
        VacationRequest? CreateRequest(VacationRequest request, int currentUserId, UserRole currentUserRole);
        VacationRequest? UpdateRequest(int id, VacationRequest request, int currentUserId, UserRole currentUserRole);
        bool DeleteRequest(int id, int currentUserId, UserRole currentUserRole);
        VacationRequest? ApproveRequest(int id, int currentUserId, UserRole currentUserRole);
        VacationRequest? RejectRequest(int id, int currentUserId, UserRole currentUserRole);
        bool HasOverlappingRequests(int userId, DateTime startDate, DateTime endDate, int? excludeRequestId = null);
        List<VacationRequest> GetRequestsForManager(int managerId);
    }

    public class VacationRequestService : IVacationRequestService
    {
        private readonly ApplicationDbContext _context;
        private readonly IUserService _userService;

        public VacationRequestService(ApplicationDbContext context, IUserService userService)
        {
            _context = context;
            _userService = userService;
        }

        public List<VacationRequest> GetAllRequests()
        {
            return _context.VacationRequests.ToList();
        }

        public VacationRequest? GetRequestById(int id)
        {
            return _context.VacationRequests.FirstOrDefault(r => r.Id == id);
        }

        public List<VacationRequest> GetRequestsByUserId(int userId)
        {
            return _context.VacationRequests.Where(r => r.UserId == userId).ToList();
        }

        public VacationRequest? CreateRequest(VacationRequest request, int currentUserId, UserRole currentUserRole)
        {
            if (currentUserRole == UserRole.Collaborator && request.UserId != currentUserId)
            {
                return null;
            }

            if (HasOverlappingRequests(request.UserId, request.StartDate, request.EndDate))
            {
                return null;
            }

            if (request.StartDate >= request.EndDate)
            {
                return null;
            }

            request.Status = RequestStatus.Pending;
            _context.VacationRequests.Add(request);
            _context.SaveChanges();
            return request;
        }

        public VacationRequest? UpdateRequest(int id, VacationRequest request, int currentUserId, UserRole currentUserRole)
        {
            var existingRequest = GetRequestById(id);
            if (existingRequest == null) return null;

            if (currentUserRole == UserRole.Collaborator && existingRequest.UserId != currentUserId)
            {
                return null;
            }

            if (HasOverlappingRequests(existingRequest.UserId, request.StartDate, request.EndDate, id))
            {
                return null;
            }

            if (request.StartDate >= request.EndDate)
            {
                return null;
            }

            existingRequest.StartDate = request.StartDate;
            existingRequest.EndDate = request.EndDate;
            existingRequest.Description = request.Description;

            _context.SaveChanges();
            return existingRequest;
        }

        public bool DeleteRequest(int id, int currentUserId, UserRole currentUserRole)
        {
            var request = GetRequestById(id);
            if (request == null) return false;

            if (currentUserRole == UserRole.Collaborator && request.UserId != currentUserId)
            {
                return false;
            }

            _context.VacationRequests.Remove(request);
            _context.SaveChanges();
            return true;
        }

        public VacationRequest? ApproveRequest(int id, int currentUserId, UserRole currentUserRole)
        {
            var request = GetRequestById(id);
            if (request == null) return null;

            if (currentUserRole == UserRole.Collaborator)
            {
                return null;
            }

            if (currentUserRole == UserRole.Manager)
            {
                var requestUser = _userService.GetUserById(request.UserId);
                if (requestUser == null || requestUser.ManagerId != currentUserId)
                {
                    return null;
                }
            }

            request.Status = RequestStatus.Approved;
            _context.SaveChanges();
            return request;
        }

        public VacationRequest? RejectRequest(int id, int currentUserId, UserRole currentUserRole)
        {
            var request = GetRequestById(id);
            if (request == null) return null;

            if (currentUserRole == UserRole.Collaborator)
            {
                return null;
            }

            if (currentUserRole == UserRole.Manager)
            {
                var requestUser = _userService.GetUserById(request.UserId);
                if (requestUser == null || requestUser.ManagerId != currentUserId)
                {
                    return null;
                }
            }

            request.Status = RequestStatus.Rejected;
            _context.SaveChanges();
            return request;
        }

        public bool HasOverlappingRequests(int userId, DateTime startDate, DateTime endDate, int? excludeRequestId = null)
        {
            var userRequests = _context.VacationRequests
                .Where(r => r.UserId == userId && r.Status != RequestStatus.Rejected);

            if (excludeRequestId.HasValue)
            {
                userRequests = userRequests.Where(r => r.Id != excludeRequestId.Value);
            }

            return userRequests.Any(r =>
                (startDate >= r.StartDate && startDate <= r.EndDate) ||
                (endDate >= r.StartDate && endDate <= r.EndDate) ||
                (startDate <= r.StartDate && endDate >= r.EndDate));
        }

        public List<VacationRequest> GetRequestsForManager(int managerId)
        {
            var subordinates = _userService.GetUsersByManagerId(managerId);
            var subordinateIds = subordinates.Select(u => u.Id).ToList();

            return _context.VacationRequests
                .Where(r => subordinateIds.Contains(r.UserId))
                .ToList();
        }
    }
}