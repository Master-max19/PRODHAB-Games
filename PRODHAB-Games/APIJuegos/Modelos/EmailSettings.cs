using System;
using System.Collections.Generic;



namespace APIJuegos.Modelos
{
    public class EmailSettings
    {
        public string SmtpHost { get; set; } = "smtp.zoho.com";
        public int SmtpPort { get; set; } = 465;
        public string SmtpUser { get; set; } = string.Empty;
        public string SmtpPass { get; set; } = "tw0DPrgTuTtF";
        public string SenderName { get; set; } = "Practicantes Prodhab";
    }
    
}
