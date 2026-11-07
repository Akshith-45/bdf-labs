# Lab 2: SQLite Database and CRUD Routes

## Objective
To connect an Express.js server to an SQLite database and implement CRUD (Create, Read, Update and Delete) operations through HTTP routes.

## Technologies Used
- Node.js
- Express.js
- SQLite
- SQLite3
- Nodemon
- Postman
- Visual Studio Code

## Project Structure

```text
lab-02/
├── node_modules/
├── server.js
├── package.json
├── package-lock.json
├── bookStore.db
└── README.md
```

## Installation

Install the required dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Server URL:

```text
http://localhost:3001
```

## Database Structure

Database name: `bookStore.db`

Table name: `book`

| Column | Data Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| title | TEXT | Book title |
| author | TEXT | Author name |
| price | INTEGER | Book price |
| pages | INTEGER | Number of pages |

## CRUD API Endpoints

| HTTP Method | Endpoint | Operation |
|---|---|---|
| GET | `/books/` | Retrieve all books |
| GET | `/books/:bookId/` | Retrieve a book by ID |
| POST | `/books/` | Add a new book |
| PUT | `/books/:bookId/` | Update a book |
| DELETE | `/books/:bookId/` | Delete a book |

## Sample POST Request

Endpoint:

```text
POST http://localhost:3001/books/
```

Request body:

```json
{
  "title": "Introduction to Algorithms",
  "author": "Thomas H. Cormen",
  "price": 900,
  "pages": 800
}
```

## SQL Query Parameterization

Parameterized SQL queries using `?` placeholders are used when accepting user input. This helps prevent SQL injection.

## Database Initialization

An asynchronous `initializeDBAndServer()` function connects to the SQLite database, creates the required table and starts the Express server only after successful database initialization.

## Testing

The API routes are tested using Postman.

The tests cover:
- Retrieving all books
- Retrieving a book by ID
- Adding a book
- Updating a book
- Deleting a book

## HTTP Status Codes

| Status Code | Description |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 404 | Book not found |
| 500 | Internal server error |

## Conclusion

The application demonstrates how to connect an Express.js server to an SQLite database and perform CRUD operations through REST API endpoints. It uses asynchronous database operations and parameterized SQL queries.
