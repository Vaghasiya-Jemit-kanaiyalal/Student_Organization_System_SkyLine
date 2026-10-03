import sys
from django.core.management.base import BaseCommand
from django.conf import settings
from accounts.services.email_service import process_membership_checks


class Command(BaseCommand):
    help = (
        "Automatically checks all member expiry dates, updates expired statuses, "
        "and dispatches expiry reminders (e.g. 30, 7, 1 days before expiry) "
        "and expired/due notices without sending duplicate emails."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=str,
            default=None,
            help='Comma-separated list of reminder days before expiry (e.g. --days 30,7,1). Overrides settings.'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate checking and display which emails would be sent without actually sending them or updating database.'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force sending emails even if a notification for this period was previously recorded.'
        )

    def handle(self, *args, **options):
        days_arg = options.get('days')
        dry_run = options.get('dry_run', False)
        force = options.get('force', False)

        if days_arg:
            try:
                reminder_days = [int(d.strip()) for d in days_arg.split(',') if d.strip()]
            except ValueError:
                self.stderr.write(self.style.ERROR("Invalid format for --days. Please use integers like --days 30,7,1"))
                sys.exit(1)
        else:
            reminder_days = getattr(settings, 'MEMBERSHIP_EXPIRY_REMINDER_DAYS', [30, 7, 1])

        mode_str = " [DRY-RUN MODE]" if dry_run else ""
        self.stdout.write(self.style.MIGRATE_HEADING(f"=== SkyLine Membership Checker{mode_str} ==="))
        self.stdout.write(f"Reminder Thresholds: {reminder_days} days before expiry")
        self.stdout.write(f"Duplicate Suppression: {'Disabled (--force active)' if force else 'Enabled'}\n")

        stats = process_membership_checks(
            reminder_days=reminder_days,
            dry_run=dry_run,
            force=force
        )

        self.stdout.write(self.style.SUCCESS("\n=== Execution Summary ==="))
        self.stdout.write(f"• Total Members Checked: {stats['total_checked']}")
        self.stdout.write(f"• Statuses Updated to Expired: {stats['status_updated_to_expired']}")
        self.stdout.write(self.style.SUCCESS(f"• Expiry Reminders Sent: {stats['reminders_sent']}"))
        self.stdout.write(self.style.SUCCESS(f"• Expired Notices Sent: {stats['expired_sent']}"))
        self.stdout.write(f"• Duplicates Skipped (Already Sent): {stats['already_sent']}")
        if stats['failed'] > 0:
            self.stdout.write(self.style.ERROR(f"• Failed Deliveries: {stats['failed']}"))
        else:
            self.stdout.write(f"• Failed Deliveries: 0")

        self.stdout.write(self.style.SUCCESS("\nMembership check process completed successfully."))
