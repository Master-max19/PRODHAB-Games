using System.Security.Cryptography;
using System.Text;

namespace APIJuegos.Data.Helpers
{
    public static class PasswordHelper
    {
        public static byte[] HashPassword(string password, string salt)
        {
            using var sha = SHA256.Create();
            return sha.ComputeHash(Encoding.Unicode.GetBytes(salt + password));
        }

        public static string GenerateSalt(int length = 16)
        {
            var randomBytes = new byte[length];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }
    }
}
