# API Documentation

### Base URL

```
/api/auth
```

### Routes

#### 1. Check Email Exists

- **URL:** `/email/check`
- **Method:** `GET`
- **Description:** Check if an email exists in the system.
- **Request:**

  - **Query Parameters:** id (string, required): The email to check.

- **Response:**
  - **Status:** `200 OK`
  - **Body:**
    ```json
    {
      "status": 200,
      "message": "OK",
      "email_exists": true | false
    }
    ```

#### 2. Register User Email

- **URL:** `/email/register`
- **Method:** `POST`
- **Description:** Register a new user by email.
- **Request:**
  - **Body:**
    ```json
    {
      "email": "user@example.com",
      "username": "username"
    }
    ```
- **Response:**
  - **Status:** `201 Created`
  - **Body:**
    ```json
    {
      "status": 201,
      "message": "Created",
      "next_path": "/api/auth/email/verify"
    }
    ```

#### 3. Verify User Email

- **URL:** `/email/verify`
- **Method:** `POST`
- **Description:** Verify the user's email using OTP.
- **Request:**
  - **Body:**
    ```json
    {
      "otp": "123456"
    }
    ```
- **Response:**
  - **Status:** `200 OK`
  - **Body:**
    ```json
    {
      "status": 200,
      "message": "OK",
      "next_path": "/api/auth/challenge/pwd"
    }
    ```

#### 4. Resend OTP

- **URL:** `/email/resend`
- **Method:** `POST`
- **Description:** Resend the OTP to the user's email.
- **Request:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body:**
    ```json
    {
      "status": 200,
      "message": "OK"
    }
    ```

#### 5. Create New User

- **URL:** `/challenge/pwd`
- **Method:** `POST`
- **Description:** Create a new user with a password.
- **Request:**
  - **Body:**
    ```json
    {
      "password": "password123"
    }
    ```
- **Response:**
  - **Status:** `201 Created`
  - **Body:**
    ```json
    {
      "status": 201,
      "message": "User created"
    }
    ```

#### 6. Login User

- **URL:** `/login/email`
- **Method:** `POST`
- **Description:** Authenticate the user and generate tokens.
- **Request:**
  - **Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
- **Response:**
  - **Status:** `200 OK`
  - **Cookie:** `X_AUTH_TOKEN` `X_REFRESH_TOKEN`
  - **Body:**
    ```json
    {
      "status": 200,
      "message": "OK",
      "tokens": {
        "accessToken": "access_token",
        "refreshToken": "refresh_token"
      }
    }
    ```

#### 7. Forget Password

- **URL:** `/pwd/forget`
- **Method:** `POST`
- **Description:** Request a password reset link.
- **Request:**
  - **Body:**
    ```json
    {
      "email": "user@example.com"
    }
    ```
- **Response:**
  - **Status:** `200 OK`
  - **Body:**
    ```json
    {
      "status": 200,
      "message": "OK",
      "next_path": "/api/auth/pwd/reset?mail=true"
    }
    ```

#### 8. Reset User forgot Password

- **URL:** `/pwd/reset?mail=true`
- **Method:** `POST`
- **Description:** Reset the user's password using the reset token.
- **Request:**
  - **Body:**
    ```json
    {
      "resetToken": "reset_token",
      "newPassword": "new_password123"
    }
    ```
- **Response:**
  - **Status:** `200 OK`
  - **Body:**
    ```json
    {
      "status": 200,
      "message": "OK"
    }
    ```

#### 9. Generate New Access Token

- **URL:** `/token/renew`
- **Method:** `POST`
- **Description:** Generate a new access token using the refresh token.
- **Request:**
  - **Body:**
    ```json
    {
      "refreshToken": "refresh_token"
    }
    ```
- **Response:**
  - **Status:** `200 OK`
  - **Body:**
    ```json
    {
      "status": 200,
      "message": "OK",
      "newAccessToken": "new_access_token"
    }
    ```

#### 10. Logout User

- **URL:** `/logout`
- **Method:** `POST`
- **Description:** Logout the user and clear tokens.
- **Request:** None `authenticated request`
- **Response:**
  - **Status:** `200 OK`
  - **Body:**
    ```json
    {
      "status": 200,
      "message": "OK"
    }
    ```

#### 11. Get CSRF Token

- **URL:** `/csrf`
- **Method:** `GET`
- **Description:** Get the CSRF token.
- **Request:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body:**
    ```json
    {
      "status": 200,
      "message": "OK",
      "csrf": "csrf_token",
      "header_naame": "X-CSRF-TOKEN"
    }
    ```