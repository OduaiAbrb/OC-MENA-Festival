"""
Management command to fix all database schema issues.
Drops and recreates tables with correct schema matching Django models.
"""
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Fix all database schema issues by recreating broken tables'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            self.stdout.write('Fixing ALL database schema issues...')
            
            # ============ PAYMENT_ATTEMPTS ============
            self.stdout.write('Recreating payment_attempts table...')
            cursor.execute('DROP TABLE IF EXISTS payment_attempts CASCADE')
            cursor.execute('''
                CREATE TABLE payment_attempts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    order_id UUID NOT NULL,
                    stripe_payment_intent_id VARCHAR(100),
                    amount_cents INTEGER NOT NULL,
                    currency VARCHAR(3) DEFAULT 'USD',
                    status VARCHAR(20) DEFAULT 'INITIATED',
                    failure_code VARCHAR(100) DEFAULT '',
                    failure_message TEXT DEFAULT '',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            ''')
            self.stdout.write(self.style.SUCCESS('✓ payment_attempts recreated'))
            
            # ============ STRIPE_EVENTS ============
            self.stdout.write('Recreating stripe_events table...')
            cursor.execute('DROP TABLE IF EXISTS stripe_events CASCADE')
            cursor.execute('''
                CREATE TABLE stripe_events (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    stripe_event_id VARCHAR(100) UNIQUE NOT NULL,
                    event_type VARCHAR(100) NOT NULL,
                    processed BOOLEAN DEFAULT FALSE,
                    processing_error TEXT DEFAULT '',
                    payload JSONB DEFAULT '{}',
                    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    processed_at TIMESTAMP WITH TIME ZONE
                )
            ''')
            self.stdout.write(self.style.SUCCESS('✓ stripe_events recreated'))
            
            # ============ ORDERS ============
            self.stdout.write('Checking orders table...')
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'")
            order_columns = [row[0] for row in cursor.fetchall()]
            
            if not order_columns:
                cursor.execute('''
                    CREATE TABLE orders (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        order_number VARCHAR(20) UNIQUE NOT NULL,
                        buyer_id UUID NOT NULL,
                        status VARCHAR(20) DEFAULT 'CREATED',
                        subtotal_cents INTEGER DEFAULT 0,
                        fees_cents INTEGER DEFAULT 0,
                        tax_cents INTEGER DEFAULT 0,
                        total_cents INTEGER DEFAULT 0,
                        currency VARCHAR(3) DEFAULT 'USD',
                        stripe_payment_intent_id VARCHAR(100) UNIQUE,
                        idempotency_key VARCHAR(100) UNIQUE NOT NULL,
                        refunded_cents INTEGER DEFAULT 0,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        paid_at TIMESTAMP WITH TIME ZONE
                    )
                ''')
                self.stdout.write(self.style.SUCCESS('✓ orders created'))
            else:
                for col in ['stripe_payment_intent_id', 'paid_at', 'idempotency_key', 'refunded_cents']:
                    if col not in order_columns:
                        if col == 'idempotency_key':
                            cursor.execute(f"ALTER TABLE orders ADD COLUMN {col} VARCHAR(100)")
                        elif col == 'refunded_cents':
                            cursor.execute(f"ALTER TABLE orders ADD COLUMN {col} INTEGER DEFAULT 0")
                        elif col == 'paid_at':
                            cursor.execute(f"ALTER TABLE orders ADD COLUMN {col} TIMESTAMP WITH TIME ZONE")
                        else:
                            cursor.execute(f"ALTER TABLE orders ADD COLUMN {col} VARCHAR(100)")
                        self.stdout.write(self.style.SUCCESS(f'✓ Added {col} to orders'))
            
            # ============ ORDER_ITEMS ============
            self.stdout.write('Checking order_items table...')
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items'")
            if not cursor.fetchall():
                cursor.execute('''
                    CREATE TABLE order_items (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        order_id UUID NOT NULL,
                        ticket_type_id UUID NOT NULL,
                        quantity INTEGER NOT NULL,
                        unit_price_cents INTEGER NOT NULL,
                        total_cents INTEGER NOT NULL
                    )
                ''')
                self.stdout.write(self.style.SUCCESS('✓ order_items created'))
            
            # ============ TICKETS ============
            self.stdout.write('Recreating tickets table...')
            cursor.execute('DROP TABLE IF EXISTS tickets CASCADE')
            cursor.execute('''
                CREATE TABLE tickets (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    ticket_code VARCHAR(32) UNIQUE NOT NULL,
                    owner_id UUID NOT NULL,
                    ticket_type_id UUID NOT NULL,
                    order_id UUID,
                    status VARCHAR(20) DEFAULT 'ISSUED',
                    qr_secret_version INTEGER DEFAULT 1,
                    qr_payload_hash VARCHAR(64) DEFAULT '',
                    is_comp BOOLEAN DEFAULT FALSE,
                    comp_id UUID,
                    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    used_at TIMESTAMP WITH TIME ZONE
                )
            ''')
            self.stdout.write(self.style.SUCCESS('✓ tickets recreated'))
            
            # ============ TICKET_TRANSFERS ============
            self.stdout.write('Recreating ticket_transfers table...')
            cursor.execute('DROP TABLE IF EXISTS ticket_transfers CASCADE')
            cursor.execute('''
                CREATE TABLE ticket_transfers (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    ticket_id UUID NOT NULL,
                    from_user_id UUID NOT NULL,
                    to_email VARCHAR(255) NOT NULL,
                    to_user_id UUID,
                    status VARCHAR(20) DEFAULT 'PENDING',
                    token_hash VARCHAR(64) UNIQUE NOT NULL,
                    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    accepted_at TIMESTAMP WITH TIME ZONE
                )
            ''')
            self.stdout.write(self.style.SUCCESS('✓ ticket_transfers recreated'))
            
            # ============ TICKET_UPGRADES ============
            self.stdout.write('Recreating ticket_upgrades table...')
            cursor.execute('DROP TABLE IF EXISTS ticket_upgrades CASCADE')
            cursor.execute('''
                CREATE TABLE ticket_upgrades (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    ticket_id UUID NOT NULL,
                    from_type_id UUID NOT NULL,
                    to_type_id UUID NOT NULL,
                    diff_cents INTEGER NOT NULL,
                    status VARCHAR(20) DEFAULT 'CREATED',
                    stripe_payment_intent_id VARCHAR(100) UNIQUE,
                    comped_by_id UUID,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    completed_at TIMESTAMP WITH TIME ZONE
                )
            ''')
            self.stdout.write(self.style.SUCCESS('✓ ticket_upgrades recreated'))
            
            # ============ INVOICES ============
            self.stdout.write('Recreating invoices table...')
            cursor.execute('DROP TABLE IF EXISTS invoices CASCADE')
            cursor.execute('''
                CREATE TABLE invoices (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    order_id UUID NOT NULL UNIQUE,
                    invoice_number VARCHAR(30) UNIQUE NOT NULL,
                    pdf_url VARCHAR(500) DEFAULT '',
                    pdf_file VARCHAR(100) DEFAULT '',
                    generated_at TIMESTAMP WITH TIME ZONE
                )
            ''')
            self.stdout.write(self.style.SUCCESS('✓ invoices recreated'))
            
            # ============ SCAN_SESSIONS ============
            self.stdout.write('Recreating scan_sessions table...')
            cursor.execute('DROP TABLE IF EXISTS scan_sessions CASCADE')
            cursor.execute('''
                CREATE TABLE scan_sessions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    scanner_id UUID NOT NULL,
                    device_name VARCHAR(100) DEFAULT '',
                    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    ended_at TIMESTAMP WITH TIME ZONE,
                    is_active BOOLEAN DEFAULT TRUE,
                    total_scans INTEGER DEFAULT 0,
                    successful_scans INTEGER DEFAULT 0
                )
            ''')
            self.stdout.write(self.style.SUCCESS('✓ scan_sessions recreated'))
            
            # ============ TICKET_SCAN_LOGS ============
            self.stdout.write('Recreating ticket_scan_logs table...')
            cursor.execute('DROP TABLE IF EXISTS ticket_scan_logs CASCADE')
            cursor.execute('''
                CREATE TABLE ticket_scan_logs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    session_id UUID,
                    ticket_id UUID,
                    scanned_by_id UUID NOT NULL,
                    qr_data VARCHAR(100) NOT NULL,
                    result VARCHAR(20) NOT NULL,
                    error_message TEXT DEFAULT '',
                    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            ''')
            self.stdout.write(self.style.SUCCESS('✓ ticket_scan_logs recreated'))
            
            # ============ COMPS ============
            self.stdout.write('Checking comps table...')
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'comps'")
            if not cursor.fetchall():
                cursor.execute('''
                    CREATE TABLE comps (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        issued_by_id UUID NOT NULL,
                        to_user_id UUID NOT NULL,
                        ticket_type_id UUID NOT NULL,
                        quantity INTEGER DEFAULT 1,
                        reason VARCHAR(50) NOT NULL,
                        notes TEXT DEFAULT '',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                ''')
                self.stdout.write(self.style.SUCCESS('✓ comps created'))
            
            # ============ REFUNDS ============
            self.stdout.write('Checking refunds table...')
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'refunds'")
            if not cursor.fetchall():
                cursor.execute('''
                    CREATE TABLE refunds (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        order_id UUID NOT NULL,
                        initiated_by_id UUID NOT NULL,
                        amount_cents INTEGER NOT NULL,
                        status VARCHAR(20) DEFAULT 'REQUESTED',
                        reason VARCHAR(50) NOT NULL,
                        notes TEXT DEFAULT '',
                        stripe_refund_id VARCHAR(100),
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        processed_at TIMESTAMP WITH TIME ZONE
                    )
                ''')
                self.stdout.write(self.style.SUCCESS('✓ refunds created'))
            
            self.stdout.write(self.style.SUCCESS('\n✅ ALL database tables fixed with correct schemas!'))
