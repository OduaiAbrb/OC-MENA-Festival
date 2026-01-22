"""
Load testing with Locust for OC MENA Festival backend.

Run with: locust -f locustfile.py --host=http://localhost:8000

Scenarios:
1. High read traffic (ticket types, schedule, config)
2. Scan traffic (validate + commit)
3. Checkout bursts
"""
import json
import random
from locust import HttpUser, task, between, events
from locust.exception import RescheduleTask


class PublicUser(HttpUser):
    """Simulates public users browsing the site."""
    weight = 10
    wait_time = between(1, 3)
    
    @task(5)
    def get_public_config(self):
        """Get public configuration."""
        self.client.get("/api/config/public/")
    
    @task(3)
    def get_ticket_types(self):
        """Browse ticket types."""
        self.client.get("/api/tickets/types/")
    
    @task(2)
    def get_schedule(self):
        """View schedule."""
        self.client.get("/api/config/schedule/")
    
    @task(2)
    def get_sponsors(self):
        """View sponsors."""
        self.client.get("/api/config/sponsors/")
    
    @task(1)
    def health_check(self):
        """Health check endpoint."""
        self.client.get("/api/health/")


class AuthenticatedUser(HttpUser):
    """Simulates authenticated users."""
    weight = 5
    wait_time = between(2, 5)
    
    def on_start(self):
        """Login at start."""
        self.token = None
        response = self.client.post("/api/auth/register/", json={
            "email": f"loadtest_{random.randint(1, 1000000)}@test.com",
            "password": "TestPass123!",
            "confirm_password": "TestPass123!",
            "full_name": "Load Test User"
        })
        if response.status_code == 201:
            data = response.json()
            self.token = data.get('data', {}).get('tokens', {}).get('access')
    
    @property
    def headers(self):
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}
    
    @task(5)
    def get_my_tickets(self):
        """View my tickets."""
        if self.token:
            self.client.get("/api/tickets/my/", headers=self.headers)
    
    @task(3)
    def get_profile(self):
        """View profile."""
        if self.token:
            self.client.get("/api/auth/me/", headers=self.headers)
    
    @task(1)
    def get_orders(self):
        """View orders."""
        if self.token:
            self.client.get("/api/payments/orders/", headers=self.headers)


class ScannerUser(HttpUser):
    """Simulates staff scanners during event."""
    weight = 3
    wait_time = between(0.5, 2)
    
    def on_start(self):
        """Login as staff."""
        self.token = None
        # In real scenario, use pre-created staff accounts
        # For load test, we simulate with mock tokens
        self.valid_ticket_codes = []
    
    @property
    def headers(self):
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}
    
    @task(3)
    def validate_scan(self):
        """Validate a ticket QR code."""
        # In real load test, use actual QR data
        mock_qr = json.dumps({
            "payload": {
                "ticket_code": f"TEST{random.randint(1, 10000)}",
                "kind": "ATTENDEE"
            },
            "signature": "mock"
        })
        
        if self.token:
            self.client.post(
                "/api/scan/validate/",
                json={"qr_data": mock_qr},
                headers=self.headers
            )
    
    @task(1)
    def get_scan_stats(self):
        """Get scanning statistics."""
        if self.token:
            self.client.get("/api/scan/stats/", headers=self.headers)


class CheckoutUser(HttpUser):
    """Simulates checkout flow - burst traffic."""
    weight = 2
    wait_time = between(1, 3)
    
    def on_start(self):
        """Login at start."""
        self.token = None
        self.ticket_type_id = None
        
        # Register
        response = self.client.post("/api/auth/register/", json={
            "email": f"checkout_{random.randint(1, 1000000)}@test.com",
            "password": "TestPass123!",
            "confirm_password": "TestPass123!",
            "full_name": "Checkout User"
        })
        if response.status_code == 201:
            data = response.json()
            self.token = data.get('data', {}).get('tokens', {}).get('access')
        
        # Get ticket types
        response = self.client.get("/api/tickets/types/")
        if response.status_code == 200:
            data = response.json()
            types = data.get('data', [])
            if types:
                self.ticket_type_id = types[0].get('id')
    
    @property
    def headers(self):
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}
    
    @task(1)
    def attempt_checkout(self):
        """Attempt checkout flow."""
        if not self.token or not self.ticket_type_id:
            raise RescheduleTask()
        
        # Create payment intent
        response = self.client.post(
            "/api/payments/checkout/create-intent/",
            json={
                "items": [{"ticket_type_id": self.ticket_type_id, "quantity": 1}],
                "idempotency_key": f"loadtest-{random.randint(1, 1000000)}"
            },
            headers=self.headers
        )
        
        # Don't actually complete payment in load test


# Custom event hooks for logging
@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, **kwargs):
    if exception:
        print(f"Request failed: {name} - {exception}")


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print("Load test starting...")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("Load test completed.")
