using Microsoft.EntityFrameworkCore;
using VacationManager.Data;
using VacationManager.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var dbPath = Environment.GetEnvironmentVariable("DB_PATH") ?? "vacationmanager.db";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IVacationRequestService, VacationRequestService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .WithOrigins(
                "http://localhost:3000",           // React app local development
                "http://frontend:3000",             // Docker container network
                "http://vacation-manager-frontend:3000" // Docker container name
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");

app.UseRouting();

app.MapControllers();

app.Run();