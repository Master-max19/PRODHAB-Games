namespace APIJuegos.DTOs
{
    /*
    * Utilizado en LoginRequestDto para el proceso de enviar contraseña y usuario en la autenticación.
    */
    public class LoginRequestDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
