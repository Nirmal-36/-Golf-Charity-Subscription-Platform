from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

@shared_task
def send_winner_notification(user_email, draw_id, tier, prize_amount):
    """
    Sends an email to a lucky winner using SendGrid.
    """
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user_email,
        subject=f'Congratulations! You won Tier {tier} in Draw #{draw_id}!',
        html_content=f'''
            <h1>You're a Winner!</h1>
            <p>Congratulations, you matched {tier} numbers in our monthly charity draw.</p>
            <p><strong>Prize Amount: ${prize_amount}</strong></p>
            <p>To claim your prize, please log in to the platform and upload a screenshot of your 
               verified golf scorecards for the month in the "My Wins" section.</p>
            <p>Cheers,<br>The Golf Charity Team</p>
        '''
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
        return f"Email sent to {user_email}"
    except Exception as e:
        return f"Error sending email: {str(e)}"

@shared_task
def send_admin_proof_notification(winner_email, draw_id):
    """
    Notifies the admin that a winner has submitted proof.
    """
    # Simply using Django's built-in send_mail if SENDGRID_API_KEY is missing, 
    # but we'll stick to SendGrid for consistency if available.
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=settings.ADMIN_EMAIL,
        subject=f'New Winner Proof Submitted: {winner_email}',
        html_content=f'''
            <p>Winner <strong>{winner_email}</strong> has uploaded proof for Draw #{draw_id}.</p>
            <p>Please review it in the Admin Dashboard.</p>
        '''
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
    except:
        pass
@shared_task
def send_winner_approval_notification(user_email, draw_id, prize_amount):
    """
    Notifies the winner that their proof has been approved and payment is pending.
    """
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user_email,
        subject='Your Professional Prize Proof is Approved!',
        html_content=f'''
            <h1>Great News!</h1>
            <p>Your golf scorecard proof for Draw #{draw_id} has been verified and approved.</p>
            <p><strong>Prize Amount: ${prize_amount}</strong></p>
            <p>Our team is now processing your payout. You will receive it within 3-5 business days.</p>
            <p>Best regards,<br>The Golf Charity Team</p>
        '''
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
    except:
        pass
@shared_task
def send_welcome_email(user_email, plan_type):
    """
    Sends a premium 'Welcome to the Club' email to new subscribers.
    """
    plan_name = "Monthly" if plan_type == 'monthly' else "Yearly"
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user_email,
        subject='Welcome to the Club! Your Membership is Active ⛳️',
        html_content=f'''
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h1 style="color: #059669;">Welcome to the Club!</h1>
                <p>We're thrilled to have you as an active member of the Golf Charity platform.</p>
                <p>Your <strong>{plan_name} Membership</strong> is now active. You've officially unlocked:</p>
                <ul>
                    <li><strong>Rolling Score Tracking</strong>: Keep your handicap fresh and accurate.</li>
                    <li><strong>Monthly Prize Draws</strong>: You're automatically in the running for this month's jackpot.</li>
                    <li><strong>Charitable Impact</strong>: A portion of your fee is already heading towards your selected cause.</li>
                </ul>
                <p>Log in to your dashboard to see your impact and manage your round entries.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 14px;">Happy Golfing,<br>The Golf Charity Team</p>
                </div>
            </div>
        '''
    )
    try:
        set_sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        set_sg.send(message)
        return f"Welcome email sent to {user_email}"
    except Exception as e:
        return f"Error sending welcome email: {str(e)}"

@shared_task
def send_charity_welcome_email(user_email, org_name):
    """
    Sends a welcome email to a newly registered charity organization.
    """
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user_email,
        subject=f'Welcome to the Platform, {org_name}! ⛳️',
        html_content=f'''
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h1 style="color: #059669;">Welcome, {org_name}!</h1>
                <p>Thank you for registering your organization with the Golf Charity platform.</p>
                <p>Your application is currently being reviewed by our administrative team. We'll verify your details and notify you as soon as your profile is approved for public donations.</p>
                <p>In the meantime, you can log in to your <strong>Partner Hub</strong> to complete your profile and upload your organization's logo.</p>
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
        return f"Error sending charity welcome email: {str(e)}"

@shared_task
def send_charity_approval_email(user_email, org_name):
    """
    Sends an approval email when an organization is verified by admin.
    """
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user_email,
        subject=f'Congratulations! {org_name} is Now Approved! 🎉',
        html_content=f'''
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h1 style="color: #059669;">Mission Approved!</h1>
                <p>Great news! <strong>{org_name}</strong> has been officially verified and approved on our platform.</p>
                <p>Your organization is now visible to our community of golfers, and you are eligible to receive monthly recurring donations.</p>
                <p>Log in to your dashboard to track your incoming donations and manage your impact reports.</p>
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 10px; margin-top: 20px;">
                    <p style="margin: 0; color: #166534; font-weight: bold;">Step 1: Complete your visual profile</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #166534;">Make sure you've uploaded your high-resolution logo for the best visibility.</p>
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
        return f"Error sending charity approval email: {str(e)}"
