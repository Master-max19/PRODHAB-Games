using System.Net.Http;
using System.Text;
using APIJuegos.Data;
using APIJuegos.Modelos;
using APIJuegos.Services;
//John---------------------------------------------------
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

//-----------------------------------------------

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<JuegosProdhabContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddSingleton<IEmailService, EmailService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        policy =>
        {
            policy
                .SetIsOriginAllowed(origin => true)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    );

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
                .AllowCredentials();
        }
    );
});

//John-----------------------------------------------

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!)),
        };

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

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<JuegosProdhabContext>();

    using var transaction = db.Database.BeginTransaction();

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
    transaction.Commit();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mi API v1");
    });
}

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

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();

app.Run();
