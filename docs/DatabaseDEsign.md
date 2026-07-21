# Database Design

The Car Dealership Inventory System uses a persistent SQLite database managed via the Sequelize ORM.

## Schema Details

### Users Table

Stores details for registered users and administrators.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment | Unique user identifier. |
| `username` | STRING | Unique, Not Null | Unique username for logging in. |
| `password` | STRING | Not Null | Hashed password using `bcryptjs` (10 salt rounds). |
| `role` | ENUM('admin', 'user') | Not Null, Default: 'user' | Authentication role defining user capabilities. |
| `createdAt` | DATETIME | Generated | Automatically managed timestamp. |
| `updatedAt` | DATETIME | Generated | Automatically managed timestamp. |

---

### Vehicles Table

Stores vehicle specifications and live stock levels.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment | Unique vehicle identifier. |
| `make` | STRING | Not Null | Brand/Make of the vehicle (e.g. Toyota). |
| `model` | STRING | Not Null | Model of the vehicle (e.g. Camry). |
| `category` | STRING | Not Null | Category classification (e.g. Sedan, SUV). |
| `price` | FLOAT | Not Null | Unit price of the vehicle. |
| `quantity` | INTEGER | Not Null, Default: 0 | Number of units available in stock. |
| `createdAt` | DATETIME | Generated | Automatically managed timestamp. |
| `updatedAt` | DATETIME | Generated | Automatically managed timestamp. |
