import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Configuração do transporter do nodemailer para Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verifica a configuração do transporter
transporter.verify(function (error, success) {
  if (error) {
    console.error('Erro na configuração do Gmail:', error);
  } else {
    console.log('Servidor Gmail pronto para enviar emails');
  }
});

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    // Verifica se as variáveis de ambiente necessárias estão configuradas
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error(
        'Configurações do Gmail incompletas. Verifique as variáveis de ambiente GMAIL_USER e GMAIL_APP_PASSWORD.'
      );
      throw new Error('Configurações do Gmail incompletas');
    }

    // Em desenvolvimento, loga o email e tenta enviar
    if (process.env.NODE_ENV === 'development') {
      console.log('Tentando enviar email via Gmail:', {
        to,
        subject,
        text,
        html,
        gmailUser: process.env.GMAIL_USER,
      });
    }

    // Tenta enviar o email
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
      html,
    });

    console.log('Email enviado com sucesso via Gmail:', {
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope,
    });
    return info;
  } catch (error) {
    console.error('Erro detalhado ao enviar email via Gmail:', {
      error,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(
      'Erro ao enviar email via Gmail: ' +
        (error instanceof Error ? error.message : 'Erro desconhecido')
    );
  }
}
