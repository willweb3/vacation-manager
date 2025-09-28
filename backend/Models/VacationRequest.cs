namespace VacationManager.Models
{
    public class VacationRequest
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public RequestStatus Status { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}