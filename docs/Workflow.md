# Development & Testing Workflow

This project adheres to a strict Test-Driven Development (TDD) cycle.

## Test-Driven Development (TDD) Workflow

1. **Red Phase**: Write unit or integration tests for the proposed features in the `backend/src/tests/` folder. Run tests and observe failures:
   ```bash
   npm.cmd run test
   ```
2. **Green Phase**: Implement the minimum code necessary in the models, controllers, and routes to satisfy the tests. Verify tests pass.
3. **Refactor Phase**: Clean up the implementation (e.g. format code, optimize queries, remove duplication) while keeping the tests passing.
4. **Git Commit**: Commit the changes indicating the phase of TDD.

---

## Starting the Application

### 1. Backend Server
First, install the backend dependencies:
```bash
cd backend
npm.cmd install
```
Start the development API server:
```bash
npm.cmd run dev
```
The server will run on port `5000` and automatically create/migrate `database.sqlite` in the project root.
A default admin user is seeded on initial run:
* **Username**: `admin`
* **Password**: `admin123`

---

### 2. Frontend SPA
Install the frontend dependencies:
```bash
cd frotend/my-react-app
npm.cmd install
```
Start the local development server:
```bash
npm.cmd run dev
```
The client will run on port `5173`.
