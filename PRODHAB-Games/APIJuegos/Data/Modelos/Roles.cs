namespace APIJuegos.Data.Modelos
{
    public class Rol
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;

        // Relación uno a muchos (un rol puede tener varios usuarios)
        public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    }
}
