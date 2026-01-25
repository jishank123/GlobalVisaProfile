# MongoDB Compass Troubleshooting Guide

## 🔍 Issue: Unable to See Data Models in MongoDB Compass

Based on your setup, I can see that:
- ✅ MongoDB service is running
- ✅ Backend server is connected to MongoDB
- ✅ Data is being successfully saved to the database
- ❌ MongoDB Compass is not showing the data

## 🛠️ Solution Steps

### Step 1: Verify MongoDB Compass Connection

**Your MongoDB Connection String:**
```
mongodb://localhost:27017/academic_erp
```

**In MongoDB Compass:**
1. Open MongoDB Compass
2. Click "New Connection"
3. Enter connection string: `mongodb://localhost:27017/academic_erp`
4. Click "Connect"

### Step 2: Check Database Name

Your application is using the database name: **`academic_erp`**

**In MongoDB Compass:**
1. After connecting, look for a database named `academic_erp`
2. If you don't see it, try refreshing (F5 or refresh button)
3. Click on the database name to expand it

### Step 3: Expected Collections

You should see these collections in the `academic_erp` database:
- `clientaccounts` (from user registrations)
- `profileassessments` (from profile assessment submissions)
- Other collections as they get created

### Step 4: Force Database Creation (If Empty)

If the database doesn't appear, let's create some test data:

```bash
# Test data creation commands (run these in your terminal)
curl -X POST http://localhost:5000/api/client-accounts/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User Compass",
    "email": "compass.test@example.com",
    "phone": "+1234567890",
    "password": "TestPass123"
  }'

curl -X POST http://localhost:5000/api/profile-assessments \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Compass Test User",
    "client_email": "compass.profile@example.com",
    "client_phone": "+1987654321",
    "field_of_expertise": "Technology",
    "years_of_experience": 5,
    "current_location": "us",
    "criterion_1_awards": 2,
    "criterion_2_memberships": 1,
    "criterion_3_media": 1,
    "criterion_4_judging": 2,
    "criterion_5_contributions": 3,
    "criterion_6_publications": 2,
    "criterion_7_exhibitions": 0,
    "criterion_8_leadership": 2,
    "criterion_9_salary": 1,
    "criterion_10_commercial": 1
  }'
```

### Step 5: Alternative Connection Methods

**Method 1: Direct IP Connection**
```
mongodb://127.0.0.1:27017/academic_erp
```

**Method 2: With Authentication (if needed)**
```
mongodb://username:password@localhost:27017/academic_erp
```

**Method 3: Check Default Port**
```
mongodb://localhost:27017
```
Then navigate to the `academic_erp` database manually.

### Step 6: Verify MongoDB is Listening

Run this command to check if MongoDB is listening on the correct port:
```bash
netstat -an | findstr :27017
```

You should see:
```
TCP    0.0.0.0:27017          0.0.0.0:0              LISTENING
TCP    [::]:27017             [::]:0                 LISTENING
```

### Step 7: Check MongoDB Logs

**Windows MongoDB Log Location:**
```
C:\Program Files\MongoDB\Server\[version]\log\mongod.log
```

Look for any connection errors or issues.

## 🧪 Quick Test Commands

Run these PowerShell commands to verify data exists:

```powershell
# Test 1: Create a client account
Invoke-RestMethod -Uri "http://localhost:5000/api/client-accounts/register" -Method POST -ContentType "application/json" -Body '{
  "full_name": "MongoDB Compass Test",
  "email": "mongodb.compass@example.com",
  "phone": "+1111111111",
  "password": "TestPass123"
}'

# Test 2: Create a profile assessment
Invoke-RestMethod -Uri "http://localhost:5000/api/profile-assessments" -Method POST -ContentType "application/json" -Body '{
  "client_name": "Compass Visibility Test",
  "client_email": "visibility.test@example.com",
  "client_phone": "+2222222222",
  "field_of_expertise": "Science & Research",
  "years_of_experience": 7,
  "current_location": "us",
  "criterion_1_awards": 3,
  "criterion_2_memberships": 2,
  "criterion_3_media": 2,
  "criterion_4_judging": 3,
  "criterion_5_contributions": 3,
  "criterion_6_publications": 3,
  "criterion_7_exhibitions": 1,
  "criterion_8_leadership": 2,
  "criterion_9_salary": 2,
  "criterion_10_commercial": 1
}'
```

After running these commands, refresh MongoDB Compass and you should see:
- Database: `academic_erp`
- Collections: `clientaccounts`, `profileassessments`
- Documents in each collection

## 🔧 Common Issues & Solutions

### Issue 1: Database Not Visible
**Solution:** The database only appears after the first document is inserted. Run the test commands above.

### Issue 2: Wrong Connection String
**Solution:** Use exactly: `mongodb://localhost:27017/academic_erp`

### Issue 3: MongoDB Compass Cache
**Solution:** 
1. Close MongoDB Compass completely
2. Clear cache: Delete `%APPDATA%\MongoDB Compass\` folder
3. Restart MongoDB Compass
4. Reconnect

### Issue 4: Firewall/Port Issues
**Solution:**
1. Check Windows Firewall settings
2. Ensure port 27017 is not blocked
3. Try connecting to `127.0.0.1` instead of `localhost`

### Issue 5: MongoDB Service Issues
**Solution:**
```bash
# Restart MongoDB service
net stop MongoDB
net start MongoDB
```

## 📊 Expected Data Structure

Once connected, you should see:

**Database: academic_erp**
- **Collection: clientaccounts**
  - Documents with fields: full_name, email, password_hash, etc.
- **Collection: profileassessments** 
  - Documents with fields: client_name, client_email, criterion_1_awards, etc.

## 🎯 Final Verification

After following these steps, you should be able to:
1. ✅ Connect to MongoDB Compass
2. ✅ See the `academic_erp` database
3. ✅ View collections: `clientaccounts`, `profileassessments`
4. ✅ Browse documents in each collection
5. ✅ See all the form data that was submitted

If you're still having issues, please share:
1. The exact error message from MongoDB Compass
2. Screenshot of your connection screen
3. Result of the test commands above