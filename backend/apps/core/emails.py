from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

@shared_task
def send_winner_notification(user_email, draw_id, tier, prize_amount):
    """
    Winner Notification: High-impact announcement email.
    Dispatched via SendGrid to notify winners of their match results 
    and provide instructions for verification proof submission.
    """
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user_email,
        subject=f'Congratulations! You won Tier {tier} in Draw #{draw_id}!',
        html_content=f'''
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h1 style="color: #059669;">You\'re a Winner!</h1>
                <p>Congratulations, you matched <strong>{tier} numbers</strong> in our monthly charity draw.</p>
                <div style="background-color: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; font-size: 18px; color: #166534;"><strong>Prize Amount: ${prize_amount}</strong></p>
                </div>
                <p>To claim your prize, please log in to the platform and upload a screenshot of your 
                   verified golf scorecards for the month in the "My Wins" section.</p>
                <p>Best regards,<br>The Golf Charity Team</p>
            </div>
        '''
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
        return f"Winner notification sent to {user_email}"
    except Exception as e:
        return f"SendGrid Error (Winner Notification): {str(e)}"

@shared_task
def send_admin_proof_notification(winner_email, draw_id):
    """
    Administrative Alert: Notifies staff of new verification submissions.
    Ensures rapid turnaround for manual prize approval workflows.
    """
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=settings.ADMIN_EMAIL,
        subject=f'Action Required: Winner Proof Submitted - {winner_email}',
        html_content=f'''
            <p><strong>{winner_email}</strong> has uploaded verification proof for Draw #{draw_id}.</p>
            <p>Please review and verify the submission in the Admin Dashboard.</p>
        '''
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
    except Exception:
        pass

@shared_task
def send_winner_approval_notification(user_email, draw_id, prize_amount):
    """
    Verification Success: Confirms manual approval of prize proof.
    Signals the transition of the win record to the 'payout scheduled' state.
    """
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user_email,
        subject='Verification Approved: Your Prize is on the Way!',
        html_content=f'''
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h1 style="color: #059669;">Great News!</h1>
                <p>Your golf scorecard proof for Draw #{draw_id} has been verified and approved.</p>
                <p><strong>Prize Amount: ${prize_amount}</strong></p>
                <p>Our team is now processing your payout. You should receive it via your linked bank account within 3-5 business days.</p>
                <p>Cheers,<br>The Golf Charity Team</p>
            </div>
        '''
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
    except Exception:
        pass

@shared_task
def send_welcome_email(user_email, plan_type):
    """
    Member Onboarding: Formal welcome sequence for newly active subscribers.
    Highlights platform benefits and encourages immediate community engagement.
    """
    plan_name = "Monthly" if plan_type == 'monthly' else "Yearly"
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user_email,
        subject='Welcome to the Club! Your Membership is Active',
        html_content=f'''
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h1 style="color: #059669;">Welcome to the Club!</h1>
                <p>We\'re thrilled to have you as an active member of the Eagle Golf Charity community.</p>
                <p>Your <strong>{plan_name} Membership</strong> is now active. You\'ve unlocked:</p>
                <ul>
                    <li><strong>Rolling Score Tracking</strong>: Automated performance analytics.</li>
                    <li><strong>Monthly Prize Draws</strong>: Automated entry for the current jackpot.</li>
                    <li><strong>Charitable Impact</strong>: Transparent donation tracking to your chosen cause.</li>
                </ul>
                <p>Log in to your dashboard to get started.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 14px;">Happy Golfing,<br>The Golf Charity Team</p>
                </div>
            </div>
        '''
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
        return f"Welcome email sent to {user_email}"
    except Exception as e:
        return f"SendGrid Error (Welcome Email): {str(e)}"

@shared_task
def send_charity_welcome_email(user_email, org_name):
    """
    Partner Onboarding: Confirmation of charity registration.
    Sets expectations for the administrative vetting and approval lifecycle.
    """
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user_email,
        subject=f'Registration Confirmation: {org_name}',
        html_content=f'''
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h1 style="color: #059669;">Welcome, {org_name}!</h1>
                <p>Thank you for initiating your partnership application with Eagle Golf Charity.</p>
                <p>Your application is currently being reviewed by our vetting team. We will notify you electronically as soon as your profile is approved for public fundraising.</p>
                <p>In the meantime, you can log in to your <strong>Partner Hub</strong> to optimize your organization\'s story and media assets.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 14px;">Best regards,<br>The Golf Charity Team</p>
                </div>
            </div>
        '''
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
        return f"Charity welcome email sent to {user_email}"
    except Exception as e:
        return f"SendGrid Error (Charity Welcome): {str(e)}"

@shared_task
def send_charity_approval_email(user_email, org_name):
    """
    Partner Activation: Notification of successful profile vetting.
    Confirms visibility in the public charity directory and eligibility for donations.
    """
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user_email,
        subject=f'Mission Approved: {org_name} is Now Live! 🎉',
        html_content=f'''
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h1 style="color: #059669;">Application Approved!</h1>
                <p>Great news! <strong>{org_name}</strong> has been officially verified and published on our platform.</p>
                <p>Your organization is now visible to our community, and you are eligible to receive monthly recurring donations from our members.</p>
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 10px; margin-top: 20px;">
                    <p style="margin: 0; color: #166534; font-weight: bold;">Tip: Complete your profile</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #166534;">Ensure you have uploaded a high-resolution logo to maximize donor engagement.</p>
                </div>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 14px;">Keep up the great work,<br>The Golf Charity Team</p>
                </div>
            </div>
        '''
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
        return f"Charity approval email sent to {user_email}"
    except Exception as e:
        return f"SendGrid Error (Charity Approval): {str(e)}"

@shared_task
def send_otp_email(user_email, otp_code, purpose="password reset"):
    """
    Security Protocol: Dispatcher for multi-factor verification codes.
    Simple, high-visibility 6-digit code for account security and recovery.
    """
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user_email,
        subject=f'Verification Code: {otp_code}',
        html_content=f'''
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h1 style="color: #059669;">Security Verification</h1>
                <p>Hello,</p>
                <p>You requested a code for <strong>{purpose}</strong>. Please use the verification code below:</p>
                <div style="background-color: #f0fdf4; padding: 30px; border-radius: 20px; text-align: center; margin: 30px 0;">
                    <span style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #166534;">{otp_code}</span>
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes. If you did not request this, please secure your account.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">The Golf Charity Team</p>
                </div>
            </div>
        '''
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
        return f"Security OTP sent to {user_email}"
    except Exception as e:
        return f"SendGrid Error (OTP Dispatch): {str(e)}"
