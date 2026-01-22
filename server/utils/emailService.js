const sgMail = require('@sendgrid/mail');

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Verify configuration on startup
if (!process.env.SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY is not set!');
} else {
  console.log('✅ SendGrid is configured');
  console.log('📧 Sending from:', process.env.EMAIL_FROM);
}

// Send verification email with code
exports.sendVerificationEmail = async (email, code, firstName) => {
  try {
    console.log('📧 Attempting to send verification email...');
    console.log('   To:', email);
    console.log('   From:', process.env.EMAIL_FROM);
    console.log('   Code:', code);
    
    const msg = {
      to: email,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'iTrust Muslim Matrimonials'
      },
      subject: 'Your Verification Code - iTrust Muslim Matrimonials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #E66386 0%, #ff7fa0 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💕 iTrust Muslim Matrimonials</h1>
          </div>
          
          <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Welcome${firstName ? ', ' + firstName : ''}! 🎉</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for registering with iTrust Muslim Matrimonials. To complete your registration, please use the verification code below:
            </p>
            
            <div style="background: linear-gradient(135deg, #E66386 0%, #ff7fa0 100%); margin: 30px 0; padding: 25px; border-radius: 10px; text-align: center;">
              <p style="color: white; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; letter-spacing: 1px;">YOUR VERIFICATION CODE</p>
              <div style="background-color: white; padding: 15px 30px; border-radius: 8px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; color: #E66386; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${code}
                </span>
              </div>
            </div>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                ⏰ <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Enter this code on the verification page to activate your account and start your journey to find your perfect match.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                If you didn't create an account with iTrust Muslim Matrimonials, please ignore this email.
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                For security reasons, never share this code with anyone.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} iTrust Muslim Matrimonials. All rights reserved.</p>
            <p style="margin: 5px 0;">Finding trusted connections, one match at a time.</p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    
    console.log('✅ Verification email sent successfully!');
    console.log('   Email delivered to:', email);
    return true;

  } catch (error) {
    console.error('❌ FAILED to send verification email');
    console.error('   Error:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.statusCode);
      console.error('   Body:', error.response.body);
    }
    
    // Don't throw error - let registration continue
    // User can request a new code if needed
    return false;
  }
};