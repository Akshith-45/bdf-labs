
# Lab 3: REST API, Query Parameters, Validation and Debugging

## Objective
To develop a REST API using Node.js, Express.js and SQLite. The API supports CRUD operations, query parameters, sorting, filtering, pagination and input validation.

## Technologies Used
- Node.js
- Express.js
- SQLite
- SQLite3
- Postman
- Nodemon
- Visual Studio Code

## Project Structure

```text
lab-03/
├── node_modules/
├── server.js
├── package.json
├── package-lock.json
├── bookstore.db
├── .gitignore
└── README.md
```

## Installation

1. Open the project folder in VS Code.
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Server address:

```text
http://localhost:3001
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /books/ | Retrieve all books |
| GET | /books/:bookId/ | Retrieve a book by ID |
| POST | /books/ | Add a new book |
| PUT | /books/:bookId/ | Update a book |
| DELETE | /books/:bookId/ | Delete a book |

## Query Parameters

| Parameter | Description |
|---|---|
| search_q | Search books by partial title |
| order_by | Sort using an allowed column |
| order | Sort in ASC or DESC order |
| limit | Specify the maximum number of records |
| offset | Skip a specified number of records |
| min_price | Set minimum book price |
| max_price | Set maximum book price |

### Example Requests

Search:
```text
GET /books/?search_q=Python
```

Sorting:
```text
GET /books/?order_by=price&order=DESC
```

Price filtering:
```text
GET /books/?min_price=500&max_price=700
```

Pagination:
```text
GET /books/?limit=3&offset=0
```

## Input Validation

The API validates:
- Missing book title
- Missing author
- Non-numeric price
- Invalid sorting columns
- Invalid pagination values

Invalid requests return HTTP 400 with a JSON error message.

## HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Book created successfully |
| 400 | Invalid input |
| 404 | Book not found |
| 500 | Internal server error |

## Database

SQLite is used to store book information.

The `book` table contains:
- id
- title
- author
- price
- pages

Parameterized SQL queries are used for user-provided values.

## Testing

All API operations are tested using Postman, including CRUD operations, search, sorting, price filtering, pagination and validation.

## Conclusion

The REST API was developed successfully using Express.js and SQLite. It supports CRUD operations, query parameters, input validation and appropriate HTTP status codes.
