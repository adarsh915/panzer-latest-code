import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: process.env.MAIL_PORT === '465', // true for 465, false for other ports like 587
  auth: {
    user: process.env.MAIL_USERNAME || 'hello@codespine.in',
    pass: process.env.MAIL_PASSWORD || '', // User must fill this in .env
  },
})

export const sendQuestionnaireEmail = async ({
  adminEmail,
  firstName,
  lastName,
  userEmail,
  department,
  notes,
  questionnaireName,
  filePath,
  fileName,
}: {
  adminEmail: string
  firstName: string
  lastName: string
  userEmail: string
  department: string
  notes: string
  questionnaireName: string
  filePath?: string
  fileName?: string
}) => {
  const fromAddress = process.env.MAIL_FROM_ADDRESS || 'hello@codespine.in'
  const fromName = process.env.MAIL_FROM_NAME || 'Panzer IT'

  const htmlContent = `
    <h2>New Resource Request</h2>
    <p>A user has submitted the questionnaire for <strong>${questionnaireName}</strong>.</p>
    <br/>
    <h3>User Details:</h3>
    <ul>
      <li><strong>Name:</strong> ${firstName} ${lastName}</li>
      <li><strong>Email:</strong> ${userEmail}</li>
      <li><strong>Department/Team:</strong> ${department || 'N/A'}</li>
    </ul>
    <h3>Additional Notes:</h3>
    <p>${notes || 'No notes provided.'}</p>
    <br/>
    <p>Please find the user's uploaded file attached to this email.</p>
  `

  const attachments = []
  if (filePath && fileName) {
    attachments.push({
      filename: fileName,
      path: filePath, // Stream or absolute path
    })
  }

  const mailOptions = {
    from: `"${fromName}" <${fromAddress}>`,
    to: adminEmail, // Admin email fetched from footer settings
    subject: `Resource Request: ${questionnaireName} from ${firstName} ${lastName}`,
    html: htmlContent,
    attachments,
  }

  return transporter.sendMail(mailOptions)
}

export const sendPasswordResetEmail = async ({
  email,
  resetLink,
}: {
  email: string
  resetLink: string
}) => {
  const fromAddress = process.env.MAIL_FROM_ADDRESS || 'hello@codespine.in'
  const fromName = process.env.MAIL_FROM_NAME || 'Panzer IT'

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hello,</p>
      <p>You recently requested to reset your password for your Panzer IT admin account.</p>
      <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
      <div style="margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset My Password</a>
      </div>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      <br/>
      <p>Best regards,<br/>The Panzer IT Team</p>
    </div>
  `

  const mailOptions = {
    from: `"${fromName}" <${fromAddress}>`,
    to: email,
    subject: `Reset Your Panzer IT Admin Password`,
    html: htmlContent,
  }

  return transporter.sendMail(mailOptions)
}
