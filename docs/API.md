# API Specification

All endpoints are hosted relative to the prefix `/api`.

---

## Authentication Endpoints

### 1. Register User
* **Endpoint**: `POST /api/auth/register`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "username": "john_doe",
    "password": "password123",
    "role": "user"  // Optional. Defaults to "user". Can be "admin".
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "username": "john_doe",
      "role": "user",
      "createdAt": "2026-07-21T11:00:00.000Z",
      "updatedAt": "2026-07-21T11:00:00.000Z"
    }
  }
  ```

### 2. Login User
* **Endpoint**: `POST /api/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "username": "john_doe",
    "password": "password123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 1,
      "username": "john_doe",
      "role": "user",
      "createdAt": "2026-07-21T11:00:00.000Z",
      "updatedAt": "2026-07-21T11:00:00.000Z"
    }
  }
  ```

---

## Vehicles Endpoints

All endpoints below require authentication. Provide the JWT token in the `Authorization` header as: `Bearer <token>`.

### 3. Add Vehicle
* **Endpoint**: `POST /api/vehicles`
* **Access**: Protected (Admin Only)
* **Request Body**:
  ```json
  {
    "make": "Toyota",
    "model": "Camry",
    "category": "Sedan",
    "price": 24000,
    "quantity": 5
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "id": 1,
    "make": "Toyota",
    "model": "Camry",
    "category": "Sedan",
    "price": 24000,
    "quantity": 5,
    "createdAt": "...",
    "updatedAt": "..."
  }
  ```

### 4. View All Vehicles
* **Endpoint**: `GET /api/vehicles`
* **Access**: Protected (All Users)
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "make": "Toyota",
      "model": "Camry",
      "category": "Sedan",
      "price": 24000,
      "quantity": 5
    }
  ]
  ```

### 5. Search Vehicles
* **Endpoint**: `GET /api/vehicles/search`
* **Access**: Protected (All Users)
* **Query Parameters**:
  * `make` (Optional string, partial match)
  * `model` (Optional string, partial match)
  * `category` (Optional string, partial match)
  * `minPrice` (Optional number)
  * `maxPrice` (Optional number)
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "make": "Toyota",
      "model": "Camry",
      "category": "Sedan",
      "price": 24000,
      "quantity": 5
    }
  ]
  ```

### 6. Update Vehicle
* **Endpoint**: `PUT /api/vehicles/:id`
* **Access**: Protected (Admin Only)
* **Request Body**:
  ```json
  {
    "price": 26000,
    "quantity": 8
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "make": "Toyota",
    "model": "Camry",
    "category": "Sedan",
    "price": 26000,
    "quantity": 8,
    "createdAt": "...",
    "updatedAt": "..."
  }
  ```

### 7. Delete Vehicle
* **Endpoint**: `DELETE /api/vehicles/:id`
* **Access**: Protected (Admin Only)
* **Response (200 OK)**:
  ```json
  {
    "message": "Vehicle deleted successfully"
  }
  ```

---

## Inventory Endpoints

### 8. Purchase Vehicle
* **Endpoint**: `POST /api/vehicles/:id/purchase`
* **Access**: Protected (All Users)
* **Description**: Decreases quantity in stock by 1. Returns 400 if out of stock.
* **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "make": "Toyota",
    "model": "Camry",
    "category": "Sedan",
    "price": 26000,
    "quantity": 7
  }
  ```

### 9. Restock Vehicle
* **Endpoint**: `POST /api/vehicles/:id/restock`
* **Access**: Protected (Admin Only)
* **Request Body**:
  ```json
  {
    "quantity": 10
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "make": "Toyota",
    "model": "Camry",
    "category": "Sedan",
    "price": 26000,
    "quantity": 17
  }
  ```
