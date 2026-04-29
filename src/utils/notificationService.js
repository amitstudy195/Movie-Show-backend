const nodemailer = require('nodemailer');

/**
 * Service to handle automated E-mail and SMS notifications
 */
const notificationService = {
    /**
     * Sends a cinematic E-ticket confirmation via Email
     */
    sendEmailConfirmation: async (userEmail, booking) => {
        try {
            // In production, use process.env for these credentials
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailOptions = {
                from: `"Movie Show" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: `Your E-Ticket is Confirmed! - ${booking.movieTitle}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                        <h1 style="color: #f84464; text-align: center;">TICKET CONFIRMED!</h1>
                        <p>Hi there,</p>
                        <p>Your seats are reserved for <strong>${booking.movieTitle}</strong>.</p>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 10px;">
                            <p><strong>Theater:</strong> ${booking.theaterName}</p>
                            <p><strong>Showtime:</strong> ${booking.showtime}</p>
                            <p><strong>Seats:</strong> ${booking.seats.join(', ')}</p>
                            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                        </div>
                        <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
                            Please show this E-Ticket at the cinema entrance. 🍿
                        </p>
                    </div>
                `
            };

            // In this demo, we can now send to actual emails
            console.log(`✉️ Automated Email triggered for: ${userEmail}`);
            await transporter.sendMail(mailOptions); 
            return true;
        } catch (error) {
            console.error('Email Notification Error:', error);
            return false;
        }
    },

    /**
     * Sends a secure 6-digit OTP via Email
     */
    sendEmailOTP: async (email, otp) => {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailOptions = {
                from: `"Movie Show" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Your Login OTP: ${otp}`,
                html: `
                    <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 40px; text-align: center;">
                        <h1 style="color: #f84464;">Movie Show</h1>
                        <p style="color: #888;">Your requested authentication code is below:</p>
                        <div style="font-size: 48px; font-weight: bold; margin: 30px 0; letter-spacing: 5px; color: #fff;">
                            ${otp}
                        </div>
                        <p style="color: #666; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, please ignore.</p>
                    </div>
                `
            };

            console.log(`✉️ Email OTP [${otp}] triggered for: ${email}`);
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Email OTP Error:', error);
            return false;
        }
    },

    /**
     * Sends a secure Password Reset Link via Email
     */
    sendResetPasswordEmail: async (email, resetUrl) => {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailOptions = {
                from: `"Movie Show" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Password Recovery Protocol`,
                html: `
                    <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 40px; text-align: center;">
                        <h1 style="color: #f84464;">Identity Recovery</h1>
                        <p style="color: #888;">We detected a request to reset your cinematic vault password.</p>
                        <div style="margin: 40px 0;">
                            <a href="${resetUrl}" style="background: #f84464; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase;">Reset Your Password</a>
                        </div>
                        <p style="color: #666; font-size: 10px;">This link expires in 15 minutes. If you didn't initiate this, your account remains secure.</p>
                        <p style="color: #444; font-size: 8px; margin-top: 20px;">If the button above doesn't work, copy and paste this URL into your browser: <br/> ${resetUrl}</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Reset Email Error:', error);
            return false;
        }
    }
};

module.exports = notificationService;
