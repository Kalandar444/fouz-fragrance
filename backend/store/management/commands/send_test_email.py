import sys
from django.core.management.base import BaseCommand
from django.conf import settings
from store.emails import send_test_email, is_smtp_configured


class Command(BaseCommand):
    help = "Dispatches a luxury test order notification email to fouzfragranceae@gmail.com to verify Gmail SMTP configuration."

    def add_arguments(self, parser):
        parser.add_argument(
            '--to',
            dest='recipient',
            default=None,
            help='Optional destination email address (defaults to BUSINESS_CONTACT_EMAIL: fouzfragranceae@gmail.com)',
        )

    def handle(self, *args, **options):
        recipient = options.get('recipient') or getattr(settings, 'BUSINESS_CONTACT_EMAIL', 'fouzfragranceae@gmail.com')
        
        self.stdout.write("\n" + "=" * 65)
        self.stdout.write("  FOUZ FRAGRANCE - SMTP CONFIGURATION TEST UTILITY")
        self.stdout.write("=" * 65 + "\n")
        
        # Display Current Configuration (never reveal secret)
        host = getattr(settings, 'EMAIL_HOST', 'smtp.gmail.com')
        port = getattr(settings, 'EMAIL_PORT', 587)
        tls = getattr(settings, 'EMAIL_USE_TLS', True)
        user = getattr(settings, 'EMAIL_HOST_USER', '')
        has_pwd = bool(getattr(settings, 'EMAIL_HOST_PASSWORD', ''))
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', '')
        
        self.stdout.write(f"  - SMTP Host:       {host}:{port}")
        self.stdout.write(f"  - TLS Encryption:  {tls}")
        self.stdout.write(f"  - Sender Account:  {user or '<NOT SET>'}")
        self.stdout.write(f"  - From Header:     {from_email}")
        self.stdout.write(f"  - Password Loaded: {'[YES] (Configured securely)' if has_pwd else '[NO] (EMAIL_HOST_PASSWORD is blank)'}")
        self.stdout.write(f"  - Test Target:     {recipient}\n")
        
        if not has_pwd:
            self.stdout.write(self.style.WARNING("  [!] ATTENTION: EMAIL_HOST_PASSWORD is not set in backend/.env."))
            self.stdout.write(self.style.NOTICE(
                "\n  How to configure Gmail SMTP:\n"
                "  1. Go to your Google Account (fouzfragranceae@gmail.com): https://myaccount.google.com/security\n"
                "  2. Enable '2-Step Verification' if not already active.\n"
                "  3. Search for 'App passwords' or go to: https://myaccount.google.com/apppasswords\n"
                "  4. Create a new App Password named 'Fouz Fragrance Website'.\n"
                "  5. Copy the 16-character code (e.g. 'abcd efgh ijkl mnop').\n"
                "  6. Open backend/.env and paste it into EMAIL_HOST_PASSWORD=xxxx xxxx xxxx xxxx\n"
                "  7. Re-run this command: python manage.py send_test_email\n"
            ))
            return
            
        self.stdout.write("  Connecting to smtp.gmail.com and dispatching test order email...")
        result = send_test_email(recipient=recipient)
        
        if result['success']:
            self.stdout.write(self.style.SUCCESS(
                f"\n  [SUCCESS] {result['message']}\n"
                f"  Please check your inbox at: {result['recipient']}\n"
                f"  (Also verify Spam/Promotions tab just in case on first send).\n"
            ))
        else:
            self.stdout.write(self.style.ERROR(
                f"\n  [DELIVERY FAILED] {result['message']}\n"
            ))
            if "535" in str(result.get('error', '')) or "Authentication" in str(result.get('error', '')):
                self.stdout.write(self.style.WARNING(
                    "  [HINT] Gmail Authentication:\n"
                    "  Google rejected the password. Please verify:\n"
                    "  - You are using a 16-character 'App Password', NOT your standard Gmail login password.\n"
                    "  - 2-Step Verification is enabled on fouzfragranceae@gmail.com.\n"
                ))
            sys.exit(1)
