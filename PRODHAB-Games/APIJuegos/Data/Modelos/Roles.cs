namespace APIJuegos.Data.Modelos
{
    public class Roles
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;

        // Relación uno a muchos (un rol puede tener varios usuarios)
        public ICollection<Usuarios> Usuarios { get; set; } = new List<Usuarios>();
    }
}
 