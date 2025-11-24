using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using APIJuegos.Modelos;
using Microsoft.Extensions.Options;

namespace APIJuegos.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailService(IOptions<EmailSettings> options)
        {
            _settings = options.Value;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(_settings.SmtpUser, _settings.SmtpPass),
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_settings.SmtpUser, _settings.SenderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };

            mailMessage.To.Add(to);

            await client.SendMailAsync(mailMessage);
        }
    }
}
