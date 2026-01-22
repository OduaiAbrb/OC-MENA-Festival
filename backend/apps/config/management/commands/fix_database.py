"""
Management command to fix all database schema issues.
Drops and recreates tables with missing columns.
"""
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Fix all database schema issues by recreating broken tables'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            self.stdout.write('Fixing database schema issues...')
            
            # Drop and recreate payment_attempts table
            self.stdout.write('Fixing payment_attempts table...')
            cursor.execute('DROP TABLE IF EXISTS payment_attempts CASCADE')
            cursor.execute('''
                CREATE TABLE payment_attempts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    order_id UUID NOT NULL,
                    stripe_payment_intent_id VARCHAR(255),
                    amount_cents INTEGER NOT NULL,
                    currency VARCHAR(3) DEFAULT 'USD',
                    status VARCHAR(20) DEFAULT 'initiated',
                    error_message TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            ''')
            self.stdout.write(self.style.SUCCESS('✓ payment_attempts fixed'))
            
            # Drop and recreate stripe_events table
            self.stdout.write('Fixing stripe_events table...')
            cursor.execute('DROP TABLE IF EXISTS stripe_events CASCADE')
            cursor.execute('''
                CREATE TABLE stripe_events (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
                    event_type VARCHAR(100) NOT NULL,
                    payload JSONB,
                    processed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            ''')
            self.stdout.write(self.style.SUCCESS('✓ stripe_events fixed'))
            
            # Fix orders table if needed
            self.stdout.write('Checking orders table...')
            cursor.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'orders'
            """)
            order_columns = [row[0] for row in cursor.fetchall()]
            
            if 'stripe_payment_intent_id' not in order_columns:
                cursor.execute('ALTER TABLE orders ADD COLUMN stripe_payment_intent_id VARCHAR(255)')
                self.stdout.write(self.style.SUCCESS('✓ Added stripe_payment_intent_id to orders'))
            
            if 'paid_at' not in order_columns:
                cursor.execute('ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE')
                self.stdout.write(self.style.SUCCESS('✓ Added paid_at to orders'))
            
            # Fix order_items table if needed
            self.stdout.write('Checking order_items table...')
            cursor.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'order_items'
            """)
            item_columns = [row[0] for row in cursor.fetchall()]
            
            if not item_columns:
                cursor.execute('''
                    CREATE TABLE order_items (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        order_id UUID NOT NULL,
                        ticket_type_id UUID NOT NULL,
                        quantity INTEGER NOT NULL,
                        unit_price_cents INTEGER NOT NULL,
                        total_cents INTEGER NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                ''')
                self.stdout.write(self.style.SUCCESS('✓ Created order_items table'))
            
            # Fix tickets table
            self.stdout.write('Checking tickets table...')
            cursor.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'tickets'
            """)
            ticket_columns = [row[0] for row in cursor.fetchall()]
            
            if not ticket_columns:
                cursor.execute('''
                    CREATE TABLE tickets (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        ticket_number VARCHAR(20) UNIQUE NOT NULL,
                        order_id UUID,
                        order_item_id UUID,
                        ticket_type_id UUID NOT NULL,
                        owner_id UUID NOT NULL,
                        original_owner_id UUID NOT NULL,
                        status VARCHAR(20) DEFAULT 'active',
                        qr_code_data VARCHAR(100) UNIQUE NOT NULL,
                        checked_in_at TIMESTAMP WITH TIME ZONE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                ''')
                self.stdout.write(self.style.SUCCESS('✓ Created tickets table'))
            
            # Fix transfers table
            self.stdout.write('Checking transfers table...')
            cursor.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'ticket_transfers'
            """)
            transfer_columns = [row[0] for row in cursor.fetchall()]
            
            if not transfer_columns:
                cursor.execute('''
                    CREATE TABLE ticket_transfers (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        ticket_id UUID NOT NULL,
                        from_user_id UUID NOT NULL,
                        to_email VARCHAR(255) NOT NULL,
                        to_user_id UUID,
                        transfer_code VARCHAR(20) UNIQUE NOT NULL,
                        status VARCHAR(20) DEFAULT 'pending',
                        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                        accepted_at TIMESTAMP WITH TIME ZONE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                ''')
                self.stdout.write(self.style.SUCCESS('✓ Created ticket_transfers table'))
            
            # Fix invoices table
            self.stdout.write('Checking invoices table...')
            cursor.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'invoices'
            """)
            invoice_columns = [row[0] for row in cursor.fetchall()]
            
            if not invoice_columns:
                cursor.execute('''
                    CREATE TABLE invoices (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        order_id UUID NOT NULL UNIQUE,
                        invoice_number VARCHAR(30) UNIQUE NOT NULL,
                        pdf_url VARCHAR(500),
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                ''')
                self.stdout.write(self.style.SUCCESS('✓ Created invoices table'))
            
            # Fix scan_sessions table
            self.stdout.write('Checking scan_sessions table...')
            cursor.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'scan_sessions'
            """)
            if not cursor.fetchall():
                cursor.execute('''
                    CREATE TABLE scan_sessions (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        scanner_id UUID NOT NULL,
                        device_name VARCHAR(100),
                        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        ended_at TIMESTAMP WITH TIME ZONE,
                        is_active BOOLEAN DEFAULT TRUE,
                        total_scans INTEGER DEFAULT 0,
                        successful_scans INTEGER DEFAULT 0
                    )
                ''')
                self.stdout.write(self.style.SUCCESS('✓ Created scan_sessions table'))
            
            # Fix ticket_scan_logs table
            self.stdout.write('Checking ticket_scan_logs table...')
            cursor.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'ticket_scan_logs'
            """)
            if not cursor.fetchall():
                cursor.execute('''
                    CREATE TABLE ticket_scan_logs (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        session_id UUID,
                        ticket_id UUID,
                        scanned_by_id UUID NOT NULL,
                        qr_data VARCHAR(100) NOT NULL,
                        result VARCHAR(20) NOT NULL,
                        error_message TEXT,
                        scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                ''')
                self.stdout.write(self.style.SUCCESS('✓ Created ticket_scan_logs table'))
            
            self.stdout.write(self.style.SUCCESS('\n✅ All database schema issues fixed!'))
