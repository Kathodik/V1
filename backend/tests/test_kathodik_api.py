"""
Kathodik API Tests - Tests for chat, contact, and auth endpoints
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndRoot:
    """Health check and root endpoint tests"""
    
    def test_root_endpoint(self):
        """Test the root API endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200, f"Root endpoint failed: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"✓ Root endpoint working: {data}")


class TestChatAPI:
    """AI Chat endpoint tests"""
    
    def test_chat_send_message(self):
        """Test POST /api/chat - sending a message to AI chatbot"""
        session_id = f"test-session-{uuid.uuid4()}"
        payload = {
            "session_id": session_id,
            "message": "Welche Metalle bieten Sie an?"
        }
        response = requests.post(f"{BASE_URL}/api/chat", json=payload, timeout=60)
        assert response.status_code == 200, f"Chat API failed: {response.text}"
        data = response.json()
        assert "response" in data, "Response should contain 'response' field"
        assert "session_id" in data, "Response should contain 'session_id' field"
        assert data["session_id"] == session_id, "Session ID should match"
        assert len(data["response"]) > 10, "AI should return a meaningful response"
        print(f"✓ Chat API working - Response preview: {data['response'][:100]}...")
        return session_id
    
    def test_chat_get_history(self):
        """Test GET /api/chat/history/{session_id} - getting chat history"""
        # First send a message to create history
        session_id = f"test-history-{uuid.uuid4()}"
        payload = {
            "session_id": session_id,
            "message": "Test message for history"
        }
        send_response = requests.post(f"{BASE_URL}/api/chat", json=payload, timeout=60)
        assert send_response.status_code == 200, f"Chat send failed: {send_response.text}"
        
        # Now get history
        response = requests.get(f"{BASE_URL}/api/chat/history/{session_id}")
        assert response.status_code == 200, f"Get history failed: {response.text}"
        data = response.json()
        assert "messages" in data, "History response should contain 'messages' field"
        assert isinstance(data["messages"], list), "Messages should be a list"
        assert len(data["messages"]) >= 2, "History should have at least user and assistant messages"
        print(f"✓ Chat history working - Found {len(data['messages'])} messages")
    
    def test_chat_clear_history(self):
        """Test DELETE /api/chat/history/{session_id} - clearing chat history"""
        session_id = f"test-clear-{uuid.uuid4()}"
        # First create some history
        payload = {"session_id": session_id, "message": "Message to be cleared"}
        requests.post(f"{BASE_URL}/api/chat", json=payload, timeout=60)
        
        # Clear history
        response = requests.delete(f"{BASE_URL}/api/chat/history/{session_id}")
        assert response.status_code == 200, f"Clear history failed: {response.text}"
        data = response.json()
        assert "message" in data, "Clear response should contain a message"
        print(f"✓ Chat history clear working: {data}")


class TestContactAPI:
    """Contact form endpoint tests"""
    
    def test_contact_form_submit(self):
        """Test POST /api/contact - submitting contact form"""
        payload = {
            "name": "TEST_User Test",
            "email": "testuser@example.com",
            "phone": "+49 123 456789",
            "message": "This is a test message from automated testing"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 200, f"Contact submit failed: {response.text}"
        data = response.json()
        assert "id" in data, "Response should contain contact ID"
        assert "message" in data, "Response should contain success message"
        print(f"✓ Contact form working - ID: {data['id']}, Message: {data['message']}")
        return data["id"]
    
    def test_contact_form_validation(self):
        """Test contact form validation - invalid email"""
        payload = {
            "name": "Test User",
            "email": "invalid-email",  # Invalid email format
            "message": "Test message"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 422, f"Should reject invalid email, got: {response.status_code}"
        print("✓ Contact form validation working - rejects invalid email")
    
    def test_contact_form_required_fields(self):
        """Test contact form - missing required fields"""
        payload = {
            "name": "Test User"
            # Missing email and message
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 422, f"Should reject missing fields, got: {response.status_code}"
        print("✓ Contact form validation working - rejects missing required fields")


class TestAuthAPI:
    """User authentication endpoint tests"""
    
    @pytest.fixture(scope="class")
    def test_user_email(self):
        """Generate unique test email"""
        return f"TEST_user_{uuid.uuid4().hex[:8]}@test.com"
    
    def test_register_user(self, test_user_email):
        """Test POST /api/auth/register - registering a new user"""
        payload = {
            "email": test_user_email,
            "password": "TestPass123",
            "name": "Test User",
            "phone": "+49 123 456789"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert "verification_required" in data, "Response should indicate verification requirement"
        assert data["verification_required"] == True, "Verification should be required"
        assert "user" in data, "Response should contain user data"
        assert data["user"]["email"] == test_user_email, "User email should match"
        print(f"✓ Registration working - Token received, verification_required={data['verification_required']}")
        return data
    
    def test_register_duplicate_email(self, test_user_email):
        """Test registration with duplicate email"""
        # First register the user
        payload = {
            "email": test_user_email,
            "password": "TestPass123",
            "name": "Test User"
        }
        # First registration
        requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        # Try to register again with same email
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 400, f"Should reject duplicate email, got: {response.status_code}"
        print("✓ Duplicate email registration properly rejected")
    
    def test_login_user(self):
        """Test POST /api/auth/login - logging in"""
        # First create a user
        unique_email = f"TEST_login_{uuid.uuid4().hex[:8]}@test.com"
        register_payload = {
            "email": unique_email,
            "password": "TestPass123",
            "name": "Login Test User"
        }
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload)
        assert reg_response.status_code == 200, f"Registration failed: {reg_response.text}"
        
        # Now login
        login_payload = {
            "email": unique_email,
            "password": "TestPass123"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "Login response should contain access_token"
        assert "user" in data, "Login response should contain user data"
        assert data["user"]["email"] == unique_email, "Logged in user email should match"
        print(f"✓ Login working - Token received for {unique_email}")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        payload = {
            "email": "nonexistent@test.com",
            "password": "WrongPassword123"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 401, f"Should reject invalid credentials, got: {response.status_code}"
        print("✓ Invalid login properly rejected")
    
    def test_get_me_authenticated(self):
        """Test GET /api/auth/me - getting current user info"""
        # First create and login a user
        unique_email = f"TEST_me_{uuid.uuid4().hex[:8]}@test.com"
        register_payload = {
            "email": unique_email,
            "password": "TestPass123",
            "name": "Me Test User"
        }
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload)
        assert reg_response.status_code == 200
        token = reg_response.json()["access_token"]
        
        # Get user info with token
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200, f"Get me failed: {response.text}"
        data = response.json()
        assert "email" in data, "Response should contain email"
        assert data["email"] == unique_email, "Email should match logged in user"
        assert "name" in data, "Response should contain name"
        print(f"✓ Get me working - Retrieved user: {data['name']} ({data['email']})")
    
    def test_get_me_unauthenticated(self):
        """Test GET /api/auth/me without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403], f"Should reject unauthenticated request, got: {response.status_code}"
        print("✓ Unauthenticated request properly rejected")


class TestStatusAPI:
    """Status check endpoint tests"""
    
    def test_create_status(self):
        """Test POST /api/status - creating status check"""
        payload = {"client_name": "TEST_Automated Test"}
        response = requests.post(f"{BASE_URL}/api/status", json=payload)
        assert response.status_code == 200, f"Create status failed: {response.text}"
        data = response.json()
        assert "id" in data, "Response should contain id"
        assert data["client_name"] == payload["client_name"]
        print(f"✓ Status create working - ID: {data['id']}")
    
    def test_get_status_list(self):
        """Test GET /api/status - getting status list"""
        response = requests.get(f"{BASE_URL}/api/status")
        assert response.status_code == 200, f"Get status list failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Status list working - Found {len(data)} status entries")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
