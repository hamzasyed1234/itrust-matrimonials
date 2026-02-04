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

// ============================================================================
// MATCH REQUEST EMAIL NOTIFICATIONS
// ============================================================================

/**
 * Send confirmation email to sender when they send a match request
 * @param {String} senderEmail - Email of the person who sent the request
 * @param {String} senderName - Name of the person who sent the request
 * @param {String} receiverName - Name of the person receiving the request
 */
exports.sendMatchRequestSentEmail = async (senderEmail, senderName, receiverName) => {
  try {
    console.log('📧 Sending match request sent confirmation...');
    console.log('   To:', senderEmail);
    
    const msg = {
      to: senderEmail,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'iTrust Muslim Matrimonials'
      },
      subject: 'Match Request Sent Successfully! 💕',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #E66386 0%, #ff7fa0 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💕 iTrust Muslim Matrimonials</h1>
          </div>
          
          <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Match Request Sent! ✨</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hi <strong>${senderName}</strong>,
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your match request has been successfully sent to <strong>${receiverName}</strong>.
            </p>
            
            <div style="background-color: #f0f8ff; border-left: 4px solid #E66386; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #333; font-size: 15px;">
                📬 <strong>What's Next?</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                ${receiverName} will review your profile and respond to your request. You'll receive an email notification when they accept or decline.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/matches" 
                 style="display: inline-block; background: linear-gradient(135deg, #E66386 0%, #ff7fa0 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px;">
                View Your Matches
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 13px; margin: 5px 0; line-height: 1.5;">
                💡 <strong>Tip:</strong> While you wait, continue exploring other compatible profiles and complete your profile to increase your chances of success.
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
    console.log('✅ Match request sent email delivered!');
    return true;

  } catch (error) {
    console.error('❌ Failed to send match request sent email:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.statusCode);
      console.error('   Body:', error.response.body);
    }
    return false;
  }
};

/**
 * Send notification to receiver when they get a new match request
 * @param {String} receiverEmail - Email of the person receiving the request
 * @param {String} receiverName - Name of the person receiving the request
 * @param {String} senderName - Name of the person who sent the request
 */
exports.sendMatchRequestReceivedEmail = async (receiverEmail, receiverName, senderName) => {
  try {
    console.log('📧 Sending new match request notification...');
    console.log('   To:', receiverEmail);
    
    const msg = {
      to: receiverEmail,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'iTrust Muslim Matrimonials'
      },
      subject: `New Match Request from ${senderName}! 💝`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #E66386 0%, #ff7fa0 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💕 iTrust Muslim Matrimonials</h1>
          </div>
          
          <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">You Have a New Match Request! 💝</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hi <strong>${receiverName}</strong>,
            </p>
            
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #fff5f7 100%); padding: 25px; margin: 25px 0; border-radius: 10px; border: 2px solid #E66386;">
              <p style="margin: 0 0 10px 0; color: #E66386; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                New Connection Request
              </p>
              <p style="margin: 0; color: #333; font-size: 20px; font-weight: 600;">
                ${senderName}
              </p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                is interested in connecting with you!
              </p>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Take a moment to review their profile and decide if you'd like to connect.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/matches" 
                 style="display: inline-block; background: linear-gradient(135deg, #E66386 0%, #ff7fa0 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px;">
                Review Request
              </a>
            </div>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.5;">
                ⏰ Don't keep them waiting! Respond to the request at your earliest convenience.
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
    console.log('✅ Match request received email delivered!');
    return true;

  } catch (error) {
    console.error('❌ Failed to send match request received email:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.statusCode);
      console.error('   Body:', error.response.body);
    }
    return false;
  }
};

/**
 * Send notification when a match request is accepted
 * @param {String} senderEmail - Email of the person who originally sent the request
 * @param {String} senderName - Name of the person who originally sent the request
 * @param {String} receiverName - Name of the person who accepted
 * @param {String} receiverPhone - Phone number of the person who accepted (optional)
 */
exports.sendMatchRequestAcceptedEmail = async (senderEmail, senderName, receiverName, receiverPhone) => {
  try {
    console.log('📧 Sending match request accepted notification...');
    console.log('   To:', senderEmail);
    
    const msg = {
      to: senderEmail,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'iTrust Muslim Matrimonials'
      },
      subject: `Great News! ${receiverName} Accepted Your Request! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💕 iTrust Muslim Matrimonials</h1>
          </div>
          
          <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="font-size: 60px; margin: 0;">🎉</div>
            </div>
            
            <h2 style="color: #28a745; margin-top: 0; text-align: center;">It's a Match!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hi <strong>${senderName}</strong>,
            </p>
            
            <div style="background: linear-gradient(135deg, #f0fff4 0%, #e6ffed 100%); padding: 25px; margin: 25px 0; border-radius: 10px; border: 2px solid #28a745;">
              <p style="margin: 0 0 15px 0; color: #28a745; font-size: 16px; font-weight: 600; text-align: center;">
                ✨ Congratulations! ✨
              </p>
              <p style="margin: 0; color: #333; font-size: 18px; text-align: center; line-height: 1.6;">
                <strong>${receiverName}</strong> has accepted your match request!
              </p>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You can now connect with them directly:
            </p>
            
            ${receiverPhone ? `
            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: 600;">
                📱 Contact Information:
              </p>
              <p style="margin: 0; color: #333; font-size: 16px;">
                <strong>Phone:</strong> ${receiverPhone}
              </p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 13px;">
                (You can reach them via WhatsApp or call)
              </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/matches" 
                 style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px;">
                View Connection
              </a>
            </div>
            
            <div style="background-color: #e7f3ff; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #004085; font-size: 13px; line-height: 1.5;">
                💡 <strong>Next Steps:</strong> Reach out and start a meaningful conversation. We wish you all the best on your journey!
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
    console.log('✅ Match request accepted email delivered!');
    return true;

  } catch (error) {
    console.error('❌ Failed to send match request accepted email:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.statusCode);
      console.error('   Body:', error.response.body);
    }
    return false;
  }
};

/**
 * Send notification when a match request is declined
 * @param {String} senderEmail - Email of the person who originally sent the request
 * @param {String} senderName - Name of the person who originally sent the request
 * @param {String} receiverName - Name of the person who declined
 */
exports.sendMatchRequestDeclinedEmail = async (senderEmail, senderName, receiverName) => {
  try {
    console.log('📧 Sending match request declined notification...');
    console.log('   To:', senderEmail);
    
    const msg = {
      to: senderEmail,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'iTrust Muslim Matrimonials'
      },
      subject: 'Update on Your Match Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #6c757d 0%, #868e96 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💕 iTrust Muslim Matrimonials</h1>
          </div>
          
          <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Update on Your Match Request</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hi <strong>${senderName}</strong>,
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              We wanted to let you know that ${receiverName} has respectfully declined your match request at this time.
            </p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #6c757d; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #495057; font-size: 15px; line-height: 1.6;">
                💫 <strong>Keep Going!</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Finding the right match takes time. Don't be discouraged – there are many compatible profiles waiting to discover you!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/browse" 
                 style="display: inline-block; background: linear-gradient(135deg, #E66386 0%, #ff7fa0 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px;">
                Explore More Profiles
              </a>
            </div>
            
            <div style="background-color: #e7f3ff; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #004085; font-size: 13px; line-height: 1.5;">
                💡 <strong>Tips for Success:</strong>
              </p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #004085; font-size: 13px; line-height: 1.8;">
                <li>Complete your profile with detailed information</li>
                <li>Add recent, clear photos</li>
                <li>Be open to different possibilities</li>
                <li>Stay active and keep browsing</li>
              </ul>
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
    console.log('✅ Match request declined email delivered!');
    return true;

  } catch (error) {
    console.error('❌ Failed to send match request declined email:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.statusCode);
      console.error('   Body:', error.response.body);
    }
    return false;
  }
};