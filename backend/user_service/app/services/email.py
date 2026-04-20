import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY

PASSWORD_RESET_EXPIRY_HOURS = 1


def send_verification_email(to_email: str, token: str) -> None:
    """
    Sends an account verification email containing a one-time link.
    The link points to the frontend /verify-email route, which calls
    GET /auth/verify-email?token=... on the backend to activate the account.
    """
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    resend.Emails.send({
        "from": settings.EMAIL_FROM,
        "to": [to_email],
        "subject": "Verify your Batua account",
        "html": f"""
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
            <h2 style="color:#1f2937;margin-bottom:8px;">Verify your email</h2>
            <p style="color:#6b7280;font-size:15px;line-height:1.6;margin-bottom:24px;">
                Thanks for signing up for <strong>Batua</strong>. Click the button below
                to verify your email address and activate your account.
            </p>
            <a href="{verify_url}"
               style="display:inline-block;background:#6366f1;color:#fff;font-weight:600;
                      font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
                Verify my email
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px;line-height:1.5;">
                This link expires in 24 hours. If you didn't create a Batua account, you can
                safely ignore this email.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="color:#d1d5db;font-size:11px;">
                Can't click the button? Copy this link:<br/>
                <span style="color:#6366f1;">{verify_url}</span>
            </p>
        </div>
        """,
    })


def send_password_reset_email(to_email: str, token: str) -> None:
    """
    Sends a password reset email with a one-time link.
    The link points to the frontend /reset-password route, which calls
    POST /auth/reset-password with the token and new password.
    """
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    resend.Emails.send({
        "from": settings.EMAIL_FROM,
        "to": [to_email],
        "subject": "Reset your Batua password",
        "html": f"""
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
            <h2 style="color:#1f2937;margin-bottom:8px;">Reset your password</h2>
            <p style="color:#6b7280;font-size:15px;line-height:1.6;margin-bottom:24px;">
                We received a request to reset your <strong>Batua</strong> password.
                Click the button below to choose a new one.
            </p>
            <a href="{reset_url}"
               style="display:inline-block;background:#6366f1;color:#fff;font-weight:600;
                      font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
                Reset my password
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px;line-height:1.5;">
                This link expires in 1 hour. If you didn't request a password reset,
                you can safely ignore this email.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="color:#d1d5db;font-size:11px;">
                Can't click the button? Copy this link:<br/>
                <span style="color:#6366f1;">{reset_url}</span>
            </p>
        </div>
        """,
    })
