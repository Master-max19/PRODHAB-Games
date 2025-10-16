using Microsoft.EntityFrameworkCore;
using APIJuegos.Modelos;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace APIJuegos.Data;

public class JuegosProdhabContext : DbContext
{
    public JuegosProdhabContext(DbContextOptions<JuegosProdhabContext> options)
        : base(options)
    {
    }

    // Añadir el modelo en Dbset
    public DbSet<Juegos> Juegos { get; set; }
    public DbSet<ResultadosJuego> ResultadosJuego { get; set; }
    public DbSet<Preguntas> Preguntas { get; set; }
    public DbSet<Respuestas> Respuestas { get; set; }
    public DbSet<RangoEvaluacion> RangoEvaluacion { get; set; }
    public DbSet<PreguntaJuego> PreguntaJuego { get; set; }
    public DbSet<Usuarios> Usuarios { get; set; }




    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        // Añadir la tabla como entidad
        modelBuilder.Entity<Juegos>(entity =>
        {
            entity.HasKey(e => e.IdJuegos);
            entity.Property(e => e.Nombre).HasMaxLength(100);

        });


        // Otra forma
        // modelBuilder.Entity<Frutas>().ToTable("Frutas");

        modelBuilder.Entity<ResultadosJuego>(entity =>
        {
            entity.HasKey(rj => rj.IdResultadoJuego);

            // Nota: hasta 4 enteros y 2 decimales
            entity.Property(rj => rj.Nota)
                  .HasColumnType("decimal(6,2)");
        });


        modelBuilder.Entity<RangoEvaluacion>(entity =>
        {
            entity.HasKey(re => re.Id);
        });

        // Añadir la tabla como entidad
        modelBuilder.Entity<Preguntas>(entity =>
        {
            entity.HasKey(e => e.IdPregunta);
            entity.Property(e => e.Enunciado).HasMaxLength(255);
        });


        modelBuilder.Entity<Respuestas>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Texto).HasMaxLength(255);
        });


        modelBuilder.Entity<PreguntaJuego>(entity =>
        {
            entity.HasKey(pj => pj.IdPreguntaJuego);

        });

        modelBuilder.Entity<Usuarios>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Correo).HasMaxLength(255);
        });

    }
}
