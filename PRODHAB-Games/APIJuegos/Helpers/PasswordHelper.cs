using System.Security.Cryptography;
using System.Text;

namespace APIJuegos.Helpers
{
    public static class PasswordHelper
    {
        // Genera un hash usando PBKDF2 y devuelve byte[]
        public static byte[] HashPassword(string password, byte[] salt, int iterations = 10000, int hashByteSize = 32)
        {
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256);
            return pbkdf2.GetBytes(hashByteSize);
        }

        // Genera una sal aleatoria y devuelve byte[]
        public static byte[] GenerateSalt(int length = 16)
        {
            var randomBytes = new byte[length];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return randomBytes;
        }

        // Verifica si la contraseña coincide con el hash
        public static bool VerifyPassword(string password, byte[] salt, byte[] hashToCompare, int iterations = 10000, int hashByteSize = 32)
        {
            var computedHash = HashPassword(password, salt, iterations, hashByteSize);
            return computedHash.SequenceEqual(hashToCompare);
        }
    }
}
