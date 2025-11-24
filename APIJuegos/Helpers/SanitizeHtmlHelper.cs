// Helpers/SanitizeHtml.cs
using System.Net;
using Ganss.Xss;

namespace APIJuegos.Helpers
{
    public static class SanitizeHtmlHelper
    {
        private static readonly HtmlSanitizer sanitizer;

        static SanitizeHtmlHelper()
        {
            sanitizer = new HtmlSanitizer();

            sanitizer.AllowedTags.Clear();
            sanitizer.AllowedTags.Add("b");
            sanitizer.AllowedTags.Add("i");
            sanitizer.AllowedTags.Add("u");
            sanitizer.AllowedTags.Add("strong");
            sanitizer.AllowedTags.Add("em");
            sanitizer.AllowedTags.Add("p");
            sanitizer.AllowedTags.Add("br");
            sanitizer.AllowedTags.Add("ul");
            sanitizer.AllowedTags.Add("ol");
            sanitizer.AllowedTags.Add("li");
            sanitizer.AllowedTags.Add("a"); 

            // Limitar atributos seguros
            sanitizer.AllowedAttributes.Clear();
            sanitizer.AllowedAttributes.Add("href");
            sanitizer.AllowedAttributes.Add("title");

            // Limitar esquemas URL
            sanitizer.AllowedSchemes.Clear();
            sanitizer.AllowedSchemes.Add("http");
            sanitizer.AllowedSchemes.Add("https");
        }

        public static string Clean(string html)
        {
            var sanitized = sanitizer.Sanitize(html);
            return WebUtility.HtmlDecode(sanitized);
        }
    }
}
