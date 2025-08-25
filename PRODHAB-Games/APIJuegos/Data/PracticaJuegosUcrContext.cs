using Microsoft.EntityFrameworkCore;
using APIJuegos.Data.Modelos;

namespace APIJuegos.Data;

public class PracticaJuegosUcrContext : DbContext
{
    public PracticaJuegosUcrContext(DbContextOptions<PracticaJuegosUcrContext> options)
        : base(options)
    {
    }

    // Añadir el modelo en Dbset
    public DbSet<Juegos> Juegos { get; set; }
    public DbSet<Frutas> Frutas { get; set; }
<<<<<<< HEAD
    public DbSet<Preguntas> Preguntas { get; set; }
    public DbSet<Respuestas> Respuestas{ get; set; }
=======
>>>>>>> fc197293d377b5c4aff6d6fc7e645c1f70482542


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

       modelBuilder.Entity<Frutas>(entity =>
        {
            entity.HasKey(e => e.IdFruta);
        });



<<<<<<< HEAD
        // Añadir la tabla como entidad
        modelBuilder.Entity<Preguntas>(entity =>
        {
            entity.HasKey(e => e.idPregunta);
            entity.Property(e => e.enunciado).HasMaxLength(255);
        });


        modelBuilder.Entity<Respuestas>(entity =>
        {
            entity.HasKey(e => e.id);
            entity.Property(e => e.texto).HasMaxLength(255);
        });
=======


>>>>>>> fc197293d377b5c4aff6d6fc7e645c1f70482542
    }
}