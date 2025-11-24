using System.Collections.Generic;
using System.Reflection.Emit;
using APIJuegos.Modelos;
using Microsoft.EntityFrameworkCore;

namespace APIJuegos.Data;

public class JuegosProdhabContext : DbContext
{
    public JuegosProdhabContext(DbContextOptions<JuegosProdhabContext> options)
        : base(options) { }

    // Añadir el modelo en Dbset
    public DbSet<Juego> Juegos { get; set; }
    public DbSet<ResultadoJuego> ResultadoJuegos { get; set; }
    public DbSet<Pregunta> Preguntas { get; set; }
    public DbSet<Respuesta> Respuestas { get; set; }
    public DbSet<RangoEvaluacion> RangoEvaluaciones { get; set; }
    public DbSet<PreguntaJuego> PreguntaJuegos { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<PalabraJuego> PalabraJuegos { get; set; }
    public DbSet<TipoJuego> TipoJuegos { get; set; }
    public DbSet<Rol> Roles { get; set; }
    public DbSet<CodigoVerificacion> CodigosVerificaciones { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Juego>(entity =>
        {
            entity.HasKey(e => e.IdJuego);
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.ToTable("Juego");
        });

        modelBuilder.Entity<ResultadoJuego>(entity =>
        {
            entity.HasKey(rj => rj.IdResultadoJuego);
            entity.ToTable("ResultadoJuego");

            // Nota: hasta 4 enteros y 2 decimales
            entity.Property(rj => rj.Nota).HasColumnType("decimal(6,2)");
        });

        modelBuilder.Entity<RangoEvaluacion>(entity =>
        {
            entity.HasKey(re => re.IdRangoEvaluacion);
            entity.ToTable("RangoEvaluacion");
        });

        // Añadir la tabla como entidad
        modelBuilder.Entity<Pregunta>(entity =>
        {
            entity.HasKey(e => e.IdPregunta);
            entity.Property(e => e.Enunciado).HasMaxLength(255);
            entity.ToTable("Pregunta");
        });

        modelBuilder.Entity<Respuesta>(entity =>
        {
            entity.HasKey(e => e.IdRespuesta);
            entity.Property(e => e.Texto).HasMaxLength(255);
            entity.ToTable("Respuesta");
        });

        modelBuilder.Entity<PreguntaJuego>(entity =>
        {
            entity.HasKey(pj => pj.IdPreguntaJuego);
            entity.ToTable("PreguntaJuego");
        });

        modelBuilder.Entity<PalabraJuego>(entity =>
        {
            entity.HasKey(pj => pj.IdPalabraJuego);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario);
            entity.Property(e => e.Correo).HasMaxLength(255);
            entity.ToTable("Usuario");
        });

        modelBuilder.Entity<TipoJuego>(entity =>
        {
            entity.HasKey(tp => tp.IdTipoJuego);
            entity.ToTable("TipoJuego");
            entity.Property(tp => tp.IdTipoJuego).ValueGeneratedNever();
        });

        modelBuilder.Entity<Rol>(entity =>
        {
            entity.HasKey(r => r.IdRol);
            entity.ToTable("Rol");
            entity.Property(r => r.IdRol);
        });

        modelBuilder.Entity<CodigoVerificacion>(entity =>
        {
            entity.HasKey(cv => cv.IdCodigoVerificacion);
            entity.ToTable("CodigoVerificacion");
            entity.Property(cv => cv.IdCodigoVerificacion);
        });
    }
}
