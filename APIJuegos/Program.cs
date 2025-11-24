using System.Net.Http;
using System.Text;
using APIJuegos.Data;
using APIJuegos.Helpers;
using APIJuegos.Modelos;
using APIJuegos.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<JuegosProdhabContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddSingleton<IEmailService, EmailService>();

var allowedOrigins =
    builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? Array.Empty<string>();

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
            policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
        }
    );
});

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
    var adminEmail = builder.Configuration["DefaultAdmin:Email"];
    var adminPassword = builder.Configuration["DefaultAdmin:Password"];

    if (string.IsNullOrWhiteSpace(adminEmail))
        throw new ArgumentException("Correo no puede ser nulo o vacío");

    if (string.IsNullOrWhiteSpace(adminPassword))
        throw new ArgumentException("Contraseña no puede ser nula o vacía");

    var context = scope.ServiceProvider.GetRequiredService<JuegosProdhabContext>();
    await DataSeeder.SeedDefaultUser(context, adminEmail, adminPassword);
}

// Solo en entorno de produccion
// http://localhost:xxxx/swagger/index.html
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

// Para los archivos del wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

//

app.MapControllers();
app.Run();
