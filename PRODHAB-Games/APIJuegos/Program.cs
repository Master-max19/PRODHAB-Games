using APIJuegos.Data;
using Microsoft.EntityFrameworkCore;
//John---------------------------------------------------
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
//-----------------------------------------------


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<JuegosProdhabContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 🔹 Permitir CORS desde cualquier origen




builder.Services.AddCors(options =>
{
    // 1️⃣ Política para permitir todo (Development o test)
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .SetIsOriginAllowed(origin => true) // permite cualquier origen
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // si quieres incluir cookies
    });

    // 2️⃣ Política para frontend con cookies (producción)
    options.AddPolicy("FrontWithCookies", policy =>
    {
        policy
            .WithOrigins("http://localhost:5165") // solo tu frontend
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // importante para enviar cookies de sesión
    });
});




//John-----------------------------------------------

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];

// 🔹 Configuración de JWT
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false, // si quieres, agrega audience y valídala
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))
        };

        // Leer el token desde la cookie HttpOnly "jwt"
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (ctx.Request.Cookies.ContainsKey("jwt_admin_juegos_prodhab"))
                {
                    ctx.Token = ctx.Request.Cookies["jwt_admin_juegos_prodhab"];
                }
                return Task.CompletedTask;
            }
        };
    });

//-----------------------------------------------------


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mi API v1");
    });
}

// 🔹 Activar CORS globalmente

//app.UseCors("AllowAll");   LOS LLAME ESPESIFICAMENTE EN LAS CLASES QUE LOS VOY A USAR
//app.UseCors("FrontWithCookies");       LOS LLAME ESPESIFICAMENTE EN LAS CLASES QUE LOS VOY A USAR


app.UseHttpsRedirection();


app.UseRouting();

// ⚠️ Importante: usar CORS antes de Auth/Authorization
app.UseCors(); // ⚠️ Muy importante

app.UseAuthentication();
app.UseAuthorization();


app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mi API v1");
});

app.MapControllers();

app.Run();
