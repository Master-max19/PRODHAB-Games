using System.Text;
using APIJuegos.Data;
using APIJuegos.Modelos; // <- Ajusta según tu carpeta donde está TipoJuego
//John---------------------------------------------------
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

//-----------------------------------------------

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<JuegosProdhabContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// 🔹 Permitir CORS desde cualquier origen

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        policy =>
        {
            policy
                .SetIsOriginAllowed(origin => true) // permite cualquier origen
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); // si quieres incluir cookies
        }
    );

    // 2️⃣ Política para frontend con cookies (producción)
    options.AddPolicy(
        "FrontWithCookies",
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:8080",
                    "https://apipracticajuegos-crcxccchdhd0dcag.eastus2-01.azurewebsites.net"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); // importante para enviar cookies de sesión
        }
    );
});

//John-----------------------------------------------

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];

// 🔹 Configuración de JWT
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!)),
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
            },
        };
    });

//-----------------------------------------------------

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<JuegosProdhabContext>();

    using var transaction = db.Database.BeginTransaction(); // Inicia la transacción

    var tiposIniciales = new List<TipoJuego>
    {
        new TipoJuego { IdTipoJuego = 1, Nombre = "Test" },
        new TipoJuego { IdTipoJuego = 2, Nombre = "Ordenar palabras" },
        new TipoJuego { IdTipoJuego = 3, Nombre = "Completar texto" },
        new TipoJuego { IdTipoJuego = 4, Nombre = "Sopa de letras" },
    };

    foreach (var tipo in tiposIniciales)
    {
        if (!db.TipoJuegos.Any(t => t.IdTipoJuego == tipo.IdTipoJuego))
        {
            db.TipoJuegos.Add(tipo);
        }
    }

    db.SaveChanges();
    transaction.Commit(); // Confirma los cambios
}

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

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mi API v1");
});

app.MapControllers();

app.Run();
