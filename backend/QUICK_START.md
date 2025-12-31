# Quick Start Testing Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and set at minimum:
# - MONGO_URI (your MongoDB connection)
# - JWT_SECRET (any random string 32+ chars)
# - EMAIL_USER & EMAIL_PASS (Gmail for OTP)
```

### 3. Start MongoDB
```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas (cloud) - just update MONGO_URI in .env
```

### 4. Start Server
```bash
npm run start:dev
```

Server will run on `http://localhost:3000`

---

## 🧪 Test Using VS Code REST Client

### Install Extension
1. Open VS Code
2. Install "REST Client" extension by Huachao Mao
3. Open `test-api.http` file

### Run Tests
1. Click "Send Request" above any request
2. View response in split panel
3. Copy IDs from responses to use in next requests

---

## 📋 Quick Test Sequence

### **Test 1: Create Organizer Account**
```http
POST http://localhost:3000/api/auth/organizer/register
Content-Type: application/json

{
  "name": "Test Organizer",
  "email": "test@organizer.com",
  "password": "Test123!"
}
```

### **Test 2: Login and Get Token**
```http
POST http://localhost:3000/api/auth/organizer/login
Content-Type: application/json

{
  "email": "test@organizer.com",
  "password": "Test123!"
}
```

**✅ Copy the `access_token` from response!**

### **Test 3: Create Event**
Update `@token` variable in `test-api.http`, then:
```http
POST http://localhost:3000/api/events
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Test Event",
  "description": "Testing event creation",
  "startDate": "2025-12-30",
  "endDate": "2025-12-30",
  "startTime": "10:00",
  "endTime": "18:00",
  "location": "Test Venue",
  "city": "TestCity",
  "category": "Technology",
  "capacity": 100,
  "bannerUrl": "https://via.placeholder.com/800",
  "tickets": [
    {
      "type": "FREE",
      "name": "Free Pass",
      "price": 0,
      "quantity": 50,
      "description": "Test free ticket"
    }
  ]
}
```

**✅ Copy the `_id` from response - this is your eventId!**

### **Test 4: Publish Event**
```http
PATCH http://localhost:3000/api/events/YOUR_EVENT_ID/publish
Authorization: Bearer YOUR_TOKEN_HERE
```

### **Test 5: Register for Event (Public)**
```http
POST http://localhost:3000/api/registrations/initiate
Content-Type: application/json

{
  "eventId": "YOUR_EVENT_ID",
  "userName": "Test User",
  "userEmail": "your-email@gmail.com",
  "userPhone": "+919999999999",
  "ticketType": "FREE"
}
```

**✅ Check your email for OTP code!**
**✅ Copy the `registrationId` from response!**

### **Test 6: Verify OTP**
```http
POST http://localhost:3000/api/registrations/verify-otp
Content-Type: application/json

{
  "registrationId": "YOUR_REGISTRATION_ID",
  "otp": 123456
}
```

**✅ For FREE tickets: Registration complete! Check email for ticket!**

### **Test 7: View Dashboard**
```http
GET http://localhost:3000/api/dashboard/analytics
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🎯 Expected Results

After completing the tests above, you should see:

1. ✅ Organizer account created in MongoDB
2. ✅ JWT token received on login
3. ✅ Event created with status "DRAFT"
4. ✅ Event status changed to "PUBLISHED"
5. ✅ OTP email received
6. ✅ Registration completed
7. ✅ Ticket PDF sent via email
8. ✅ Dashboard shows 1 event, 1 registration

---

## 🔍 Verify in MongoDB

```bash
mongosh
use eventz

# View created organizer
db.organizers.find().pretty()

# View created events
db.events.find().pretty()

# View registrations
db.registrations.find().pretty()
```

---

## 🐛 Troubleshooting

### OTP Not Received?
- Check `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Enable "Less secure app access" or use App Password for Gmail
- Check spam folder
- Look in terminal logs - OTP is printed for testing

### MongoDB Connection Failed?
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list            # Mac

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in .env with Atlas connection string
```

### Token Invalid?
- Token expires after 7 days (default)
- Re-login to get new token
- Ensure `JWT_SECRET` is set in `.env`

### Event Not Found?
- Make sure event is PUBLISHED (not DRAFT)
- Verify eventId is correct
- Check: `GET http://localhost:3000/api/events`

---

## 📚 Full Documentation

For complete API documentation and advanced testing scenarios, see:
- `API_TESTING_GUIDE.md` - Detailed endpoint documentation
- `test-api.http` - All API requests with examples

---

## ✅ Success Checklist

- [ ] Backend server starts without errors
- [ ] Can create organizer account
- [ ] Can login and receive JWT token
- [ ] Can create event (protected route works)
- [ ] Can publish event
- [ ] Can view published events (public route works)
- [ ] Can initiate registration
- [ ] Receive OTP via email
- [ ] Can verify OTP
- [ ] Registration completes successfully
- [ ] Receive ticket via email
- [ ] Dashboard shows correct analytics

**All green? Backend is ready for frontend integration! 🎉**
