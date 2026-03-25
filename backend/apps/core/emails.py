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
