from flask_mail import Message
from app import mail
from app.config import Config

def send_email(to_email, subject, body):
    try:
        msg = Message(
            subject=f"[{Config.APP_NAME}] {subject}",
            recipients=[to_email],
            body=body
        )
        
        mail.send(msg)
        return True
        
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_trial_ending_reminder(user_email, service_name, days_remaining):
    subject = f"Trial Ending Soon: {service_name}"
    
    body = f"""
Hello,

Your trial for {service_name} is ending in {days_remaining} day(s).

If you don't want to be charged, please cancel the subscription before the trial ends.

You can manage your subscriptions in PayWatch.

Best regards,
PayWatch Team
    """
    
    return send_email(user_email, subject, body)

def send_credit_limit_alert(user_email, card_name, utilization_percentage):
    subject = f"Credit Limit Alert: {card_name}"
    
    body = f"""
Hello,

Your credit card "{card_name}" has reached {utilization_percentage}% of its credit limit.

Please review your spending or make a payment to avoid going over your limit.

You can view your card details in PayWatch.

Best regards,
PayWatch Team
    """
    
    return send_email(user_email, subject, body)

def send_subscription_renewal_reminder(user_email, service_name, amount, renewal_date):
    subject = f"Subscription Renewal: {service_name}"
    
    body = f"""
Hello,

Your subscription for {service_name} will renew on {renewal_date}.

Amount: ${amount} USD

You can manage or cancel this subscription in PayWatch.

Best regards,
PayWatch Team
    """
    
    return send_email(user_email, subject, body)

def send_price_change_alert(user_email, service_name, old_price, new_price):
    subject = f"Price Change Detected: {service_name}"
    
    body = f"""
Hello,

We detected a price change for your {service_name} subscription:

Previous Price: ${old_price} USD
New Price: ${new_price} USD
Change: ${new_price - old_price:.2f} USD

You can review this subscription in PayWatch.

Best regards,
PayWatch Team
    """
    
    return send_email(user_email, subject, body)

def send_verification_email(user_email, verification_token):
    subject = "Verify Your Email"
    
    verification_link = f"{Config.FRONTEND_URL}/verify-email?token={verification_token}"
    
    body = f"""
Hello,

Thank you for signing up for PayWatch!

Please verify your email address by clicking the link below:

{verification_link}

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.

Best regards,
PayWatch Team
    """
    
    return send_email(user_email, subject, body)

def send_password_reset_email(user_email, reset_token):
    subject = "Password Reset Request"
    
    reset_link = f"{Config.FRONTEND_URL}/reset-password?token={reset_token}"
    
    body = f"""
Hello,

You requested to reset your password for PayWatch.

Click the link below to reset your password:

{reset_link}

This link will expire in 1 hour.

If you didn't request this, please ignore this email and your password will remain unchanged.

Best regards,
PayWatch Team
    """
    
    return send_email(user_email, subject, body)