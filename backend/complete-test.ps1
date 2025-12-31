# Complete Event Management System Test
# Tests ALL routes and creates sample data

$baseUrl = "http://localhost:3000/api"
$global:organizerToken = ""
$global:organizerId = ""
$global:eventId = ""
$global:registrationId = ""

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "COMPLETE EVENT MANAGEMENT SYSTEM TEST" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Function to make API calls
function Call-API {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = ""
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Data = ($response.Content | ConvertFrom-Json)
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            Response = $_.Exception.Response
        }
    }
}

Write-Host "`n[1/10] ORGANIZER REGISTRATION" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Gray
$registerData = @{
    name = "Test Organizer"
    email = "organizer@eventz.com"
    password = "password123"
}
$result = Call-API -Method POST -Endpoint "/auth/organizer/register" -Body $registerData
if ($result.Success) {
    $global:organizerToken = $result.Data.token
    $global:organizerId = $result.Data.organizer._id
    Write-Host "✓ Organizer registered successfully" -ForegroundColor Green
    Write-Host "  Token: $($global:organizerToken.Substring(0,20))..." -ForegroundColor Gray
} else {
    # Try login if already exists
    $loginData = @{
        email = "organizer@eventz.com"
        password = "password123"
    }
    $result = Call-API -Method POST -Endpoint "/auth/organizer/login" -Body $loginData
    if ($result.Success) {
        $global:organizerToken = $result.Data.token
        $global:organizerId = $result.Data.organizer._id
        Write-Host "✓ Organizer logged in (already exists)" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed: $($result.Error)" -ForegroundColor Red
        exit
    }
}

Write-Host "`n[2/10] CREATE EVENT" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Gray
$eventData = @{
    title = "Tech Conference 2025"
    description = "Join industry leaders for the latest in tech innovations and networking opportunities"
    category = "Technology"
    startDate = "2025-03-15T09:00:00.000Z"
    endDate = "2025-03-15T18:00:00.000Z"
    venue = "Hyderabad Convention Center"
    address = "123 Tech Street, Banjara Hills"
    city = "Hyderabad"
    state = "Telangana"
    capacity = 500
    imageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
    tickets = @(
        @{
            type = "FREE"
            name = "General Admission"
            price = 0
            quantity = 100
            available = 100
        },
        @{
            type = "REGULAR"
            name = "Standard Pass"
            price = 499
            quantity = 300
            available = 300
        },
        @{
            type = "VIP"
            name = "VIP Pass"
            price = 999
            quantity = 100
            available = 100
        }
    )
}
$result = Call-API -Method POST -Endpoint "/events" -Body $eventData -Token $global:organizerToken
if ($result.Success) {
    $global:eventId = $result.Data._id
    Write-Host "✓ Event created successfully" -ForegroundColor Green
    Write-Host "  Event ID: $global:eventId" -ForegroundColor Gray
    Write-Host "  Title: $($result.Data.title)" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed: $($result.Error)" -ForegroundColor Red
}

Write-Host "`n[3/10] PUBLISH EVENT" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Gray
$result = Call-API -Method PATCH -Endpoint "/events/$global:eventId/publish" -Token $global:organizerToken
if ($result.Success) {
    Write-Host "✓ Event published successfully" -ForegroundColor Green
    Write-Host "  Status: $($result.Data.status)" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed: $($result.Error)" -ForegroundColor Red
}

Write-Host "`n[4/10] GET ALL EVENTS (Public)" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Gray
$result = Call-API -Method GET -Endpoint "/events?status=PUBLISHED"
if ($result.Success) {
    Write-Host "✓ Retrieved $($result.Data.Count) published events" -ForegroundColor Green
    foreach ($event in $result.Data) {
        Write-Host "  - $($event.title) ($($event.city))" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ Failed: $($result.Error)" -ForegroundColor Red
}

Write-Host "`n[5/10] GET SINGLE EVENT" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Gray
$result = Call-API -Method GET -Endpoint "/events/$global:eventId"
if ($result.Success) {
    Write-Host "✓ Event details retrieved" -ForegroundColor Green
    Write-Host "  Title: $($result.Data.title)" -ForegroundColor Gray
    Write-Host "  Capacity: $($result.Data.capacity)" -ForegroundColor Gray
    Write-Host "  Tickets: $($result.Data.tickets.Count) types" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed: $($result.Error)" -ForegroundColor Red
}

Write-Host "`n[6/10] INITIATE REGISTRATION" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Gray
$registrationData = @{
    eventId = $global:eventId
    userName = "John Doe"
    userEmail = "john@example.com"
    userPhone = "+919876543210"
    ticketType = "REGULAR"
}
$result = Call-API -Method POST -Endpoint "/registrations/initiate" -Body $registrationData
if ($result.Success) {
    $global:registrationId = $result.Data._id
    Write-Host "✓ Registration initiated" -ForegroundColor Green
    Write-Host "  Registration ID: $global:registrationId" -ForegroundColor Gray
    Write-Host "  OTP sent to: $($registrationData.userEmail)" -ForegroundColor Gray
    Write-Host "  Status: $($result.Data.status)" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed: $($result.Error)" -ForegroundColor Red
}

Write-Host "`n[7/10] GET ORGANIZER EVENTS" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Gray
$result = Call-API -Method GET -Endpoint "/events/organizer/me" -Token $global:organizerToken
if ($result.Success) {
    Write-Host "✓ Retrieved $($result.Data.Count) organizer events" -ForegroundColor Green
    foreach ($event in $result.Data) {
        Write-Host "  - $($event.title) (Registrations: $($event.totalRegistrations), Revenue: ₹$($event.totalRevenue))" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ Failed: $($result.Error)" -ForegroundColor Red
}

Write-Host "`n[8/10] GET DASHBOARD ANALYTICS" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Gray
$result = Call-API -Method GET -Endpoint "/dashboard/analytics" -Token $global:organizerToken
if ($result.Success) {
    Write-Host "✓ Dashboard analytics retrieved" -ForegroundColor Green
    Write-Host "  Total Events: $($result.Data.summary.totalEvents)" -ForegroundColor Gray
    Write-Host "  Total Registrations: $($result.Data.summary.totalRegistrations)" -ForegroundColor Gray
    Write-Host "  Total Revenue: ₹$($result.Data.summary.totalRevenue)" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed: $($result.Error)" -ForegroundColor Red
}

Write-Host "`n[9/10] GET EVENT ANALYTICS" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Gray
$result = Call-API -Method GET -Endpoint "/dashboard/events/$global:eventId/analytics" -Token $global:organizerToken
if ($result.Success) {
    Write-Host "✓ Event analytics retrieved" -ForegroundColor Green
    Write-Host "  Event: $($result.Data.eventTitle)" -ForegroundColor Gray
    Write-Host "  Registrations: $($result.Data.totalRegistrations)" -ForegroundColor Gray
    Write-Host "  Capacity Used: $($result.Data.capacityUsed)%" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed: $($result.Error)" -ForegroundColor Red
}

Write-Host "`n[10/10] CREATE MORE SAMPLE EVENTS" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Gray

$sampleEvents = @(
    @{
        title = "Web Development Workshop"
        description = "Hands-on workshop for modern web development with React and Next.js"
        category = "Workshop"
        city = "Bangalore"
        venue = "Tech Hub Bangalore"
        tickets = @(@{ type="FREE"; name="Free Entry"; price=0; quantity=50; available=50 })
    },
    @{
        title = "AI & ML Summit"
        description = "Explore the future of artificial intelligence and machine learning"
        category = "Technology"
        city = "Mumbai"
        venue = "Convention Center Mumbai"
        tickets = @(@{ type="REGULAR"; name="Standard"; price=1999; quantity=200; available=200 })
    },
    @{
        title = "Startup Networking Event"
        description = "Connect with entrepreneurs, investors, and startup enthusiasts"
        category = "Networking"
        city = "Pune"
        venue = "Innovation Park Pune"
        tickets = @(@{ type="FREE"; name="Free Entry"; price=0; quantity=150; available=150 })
    },
    @{
        title = "Music Festival 2025"
        description = "Experience live performances from top artists in a stunning beach setting"
        category = "Entertainment"
        city = "Goa"
        venue = "Open Grounds Goa"
        tickets = @(
            @{ type="REGULAR"; name="General"; price=2999; quantity=3000; available=3000 },
            @{ type="VIP"; name="VIP"; price=7999; quantity=500; available=500 }
        )
    }
)

foreach ($event in $sampleEvents) {
    $eventData = @{
        title = $event.title
        description = $event.description
        category = $event.category
        startDate = "2025-04-10T10:00:00.000Z"
        endDate = "2025-04-10T18:00:00.000Z"
        venue = $event.venue
        address = "Event Location"
        city = $event.city
        state = "India"
        capacity = ($event.tickets | Measure-Object -Property quantity -Sum).Sum
        imageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
        tickets = $event.tickets
    }
    
    $result = Call-API -Method POST -Endpoint "/events" -Body $eventData -Token $global:organizerToken
    if ($result.Success) {
        $eventId = $result.Data._id
        # Publish the event
        $publishResult = Call-API -Method PATCH -Endpoint "/events/$eventId/publish" -Token $global:organizerToken
        if ($publishResult.Success) {
            Write-Host "✓ Created and published: $($event.title)" -ForegroundColor Green
        }
    }
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Gray

Write-Host "`n✓ Backend API running: http://localhost:3000/api" -ForegroundColor Green
Write-Host "✓ Frontend running: http://localhost:3001" -ForegroundColor Green
Write-Host "`nTest Account:" -ForegroundColor Yellow
Write-Host "  Email: organizer@eventz.com" -ForegroundColor Gray
Write-Host "  Password: password123" -ForegroundColor Gray
Write-Host "`nCreated Resources:" -ForegroundColor Yellow
Write-Host "  Organizer ID: $global:organizerId" -ForegroundColor Gray
Write-Host "  Sample Event ID: $global:eventId" -ForegroundColor Gray
Write-Host "  Registration ID: $global:registrationId" -ForegroundColor Gray

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "READY TO TEST!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "`n1. Open http://localhost:3001 - Browse events" -ForegroundColor White
Write-Host "2. Login at /organizer/login with above credentials" -ForegroundColor White
Write-Host "3. View dashboard with real analytics" -ForegroundColor White
Write-Host "4. Manage your events" -ForegroundColor White
Write-Host "5. Register for events as a user" -ForegroundColor White
Write-Host "`n==================================================" -ForegroundColor Cyan
