from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Create a system administrator user manually.'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, required=True, help='Administrator email')
        parser.add_argument('--full-name', type=str, required=True, help='Administrator full name')
        parser.add_argument('--password', type=str, required=True, help='Administrator password')

    def handle(self, *args, **options):
        email = options['email'].strip().lower()
        full_name = options['full_name'].strip()
        password = options['password']

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR(f"User with email '{email}' already exists."))
            return

        admin = User.objects.create_superuser(
            email=email,
            password=password,
            full_name=full_name,
            role=User.Role.ADMIN
        )
        self.stdout.write(self.style.SUCCESS(f"Successfully created Administrator: {admin.email} (Role: {admin.role})"))
