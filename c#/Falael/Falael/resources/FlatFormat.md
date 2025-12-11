flat format
==================================

## Format Overview

The format uses section headers and separators to create a hierarchical structure with up to 3 levels of nesting (by default). Each level uses different marker characters:

- **Level 1**: `*` for headers, `=` for separators
- **Level 2**: `>` for headers, `-` for separators  
- **Level 3**: `!` for headers, `~` for separators

The header parser extracts everything after the first character and trims whitespace, so any amount of spacing (or none) produces the same section name.

The separator line length is are ignored during parsing but generated with length = 8 + (TotalLevels - CurrentDepth) when serializing as a form of pretty printing.

In the following example:
- Default configuration: 3 levels with (* =), (> -), (! ~)
- Headers: First char is marker, rest is section name
- Separators: Printed with decreasing lengths (11, 10, 9)

````
* Database Config
===========
> Connection String
----------
! Primary
~~~~~~~~~
Server=db1;Port=5432

! Backup
~~~~~~~~~
Server=db2;Port=5433

> Settings
----------
Timeout: 30
MaxPool: 100
````

Both header markers and header separators must start at the first character on the line.

Text that conflicts with section markers can be wrapped in verbatim blocks (like markdown code blocks):

````
* Title
==========
```
* Verbatim string
==========
```
````

## Sample Files

### Example 1: Simple Configuration File

````
* Database Settings
==========
> Primary Server
---------
Host: db-primary.example.com
Port: 5432
Username: admin

> Replica Server
---------
Host: db-replica.example.com
Port: 5433
Username: readonly

* Application Settings
==========
> Logging
---------
Level: INFO
MaxFileSize: 10MB
RotationCount: 5

> Cache
---------
Provider: Redis
TTL: 3600
````

### Example 2: Nested Documentation Structure

````
* API Documentation
==========
> Authentication
---------
! Bearer Token
~~~~~~
Endpoint: POST /api/auth/token
Headers: Content-Type: application/json
Body: {"username": "user", "password": "pass"}
Response: {"token": "eyJ..."}

! API Key
~~~~~~
Header: X-API-Key
Format: 32 character alphanumeric string
Example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

> Endpoints
---------
! GET /users
~~~~~~
Description: Retrieve all users
Parameters: page, limit, sort
Response: Array of user objects

! POST /users
~~~~~~
Description: Create new user
Body: {"name": "John", "email": "john@example.com"}
Response: Created user object with ID

* Rate Limiting
==========
Default: 100 requests per minute
Authenticated: 1000 requests per minute
````

### Example 3: Project Structure with Verbatim Blocks

````
* Project Overview
==========
> Architecture
---------
! Frontend
~~~~~~
Framework: React 18
Build Tool: Vite
Testing: Jest + React Testing Library

! Backend
~~~~~~
Language: C# (.NET 8)
Database: PostgreSQL
ORM: Entity Framework Core

> Code Samples
---------
! Controller Example
~~~~~~
```
[HttpGet("users/{id}")]
public async Task<IActionResult> GetUser(int id)
{
    var user = await _context.Users.FindAsync(id);
    if (user == null) return NotFound();
    return Ok(user);
}
```

! Service Pattern
~~~~~~
```
public interface IUserService
{
    Task<User> GetByIdAsync(int id);
    Task<User> CreateAsync(UserDto dto);
}
```

* Deployment
==========
> Production
---------
Environment: AWS ECS
Region: us-east-1
Instances: 3x t3.medium
````

### Example 4: Test Results Report

```
* Test Suite Results
==========
> Unit Tests
---------
! UserService Tests
~~~~~~
Total: 45
Passed: 43
Failed: 2
Coverage: 87%

! OrderService Tests
~~~~~~
Total: 32
Passed: 32
Failed: 0
Coverage: 92%

> Integration Tests
---------
! API Tests
~~~~~~
Total: 28
Passed: 26
Failed: 2
Duration: 45.3 seconds

Failed Tests:
- POST /orders should handle concurrent requests
- GET /users should paginate correctly

! Database Tests
~~~~~~
Total: 15
Passed: 15
Failed: 0
Duration: 12.7 seconds

* Performance Metrics
==========
> Response Times
---------
Average: 145ms
P95: 380ms
P99: 520ms
Max: 1230ms

> Throughput
---------
Requests/sec: 850
Concurrent Users: 100
Error Rate: 0.02%
```

### Example 5: Multi-language Documentation

```
* Translations
==========
> English
---------
! Welcome Message
~~~~~~
Title: Welcome to Our Application
Description: Your journey starts here
Button: Get Started

! Error Messages
~~~~~~
404: Page not found
500: Internal server error
401: Unauthorized access

> Spanish
---------
! Welcome Message
~~~~~~
Title: Bienvenido a Nuestra Aplicación
Description: Tu viaje comienza aquí
Button: Comenzar

! Error Messages
~~~~~~
404: Página no encontrada
500: Error interno del servidor
401: Acceso no autorizado

> Japanese
---------
! Welcome Message
~~~~~~
Title: アプリケーションへようこそ
Description: あなたの旅はここから始まります
Button: はじめる

! Error Messages
~~~~~~
404: ページが見つかりません
500: 内部サーバーエラー
401: 認証されていません
```

## Key Features

1. **Hierarchical Structure**: Supports up to 3 levels of nesting by default
2. **Section Bodies**: Can contain either text content or nested subsections
3. **Verbatim Blocks**: Text containing section markers can be escaped using ``` blocks
4. **Flexible**: Section definitions can be customized via constructor
5. **Clean Parsing**: Handles empty lines and whitespace gracefully
6. **Error Handling**: Detects duplicate section names and malformed content

The format is particularly useful for configuration files, documentation, structured reports, or any hierarchical text data that needs to be human-readable and editable.