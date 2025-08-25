using APIJuegos.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
<<<<<<< HEAD
=======
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

>>>>>>> fc197293d377b5c4aff6d6fc7e645c1f70482542
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<PracticaJuegosUcrContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

<<<<<<< HEAD
// 🔹 Permitir CORS desde cualquier origen
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

=======
>>>>>>> fc197293d377b5c4aff6d6fc7e645c1f70482542
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
<<<<<<< HEAD
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mi API v1");
    });
}

// 🔹 Activar CORS globalmente
app.UseCors("AllowAll");

app.UseHttpsRedirection();
app.MapControllers();
=======
   app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mi API v1");
 });}



app.UseHttpsRedirection();
app.MapControllers(); // esto es importante

>>>>>>> fc197293d377b5c4aff6d6fc7e645c1f70482542

app.Run();
