using System;
using System.Linq;
using System.Threading.Tasks;
using APIJuegos.Data;
using APIJuegos.Helpers;
using APIJuegos.Modelos;
using Microsoft.EntityFrameworkCore;

namespace APIJuegos.Data
{
    public static class DataSeeder
    {
        public static async Task SeedDefaultUser(
            JuegosProdhabContext context,
            string correo,
            string contrasena
        )
        {
            var defaultUser = await context.Usuarios.FirstOrDefaultAsync(u => u.Correo == correo);

            if (defaultUser != null)
                return;

            // Revisar si existe el rol "Administrador"
            var adminRole = await context.Roles.FirstOrDefaultAsync(r =>
                r.Nombre == "Administrador"
            );

            if (adminRole == null)
            {
                // Crear rol si no existe
                adminRole = new Rol { Nombre = "Administrador" };
                context.Roles.Add(adminRole);
                await context.SaveChangesAsync(); // guardar para obtener el IdRol
            }

            // Crear salt y hash de la contraseña por defecto
            var salt = PasswordHelper.GenerateSalt();
            var hash = PasswordHelper.HashPassword(contrasena, salt);

            // Crear usuario administrador por defecto
            var usuario = new Usuario
            {
                Correo = correo,
                Clave = hash,
                Salt = Convert.ToBase64String(salt),
                IdRol = adminRole.IdRol, // FK a Rol
                FechaCreacion = DateTime.UtcNow,
                Activo = true,
            };

            context.Usuarios.Add(usuario);
            await context.SaveChangesAsync();
        }
    }
}
