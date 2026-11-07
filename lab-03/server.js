
const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

let db;

// Initialize database and start server
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: "./bookstore.db",
            driver: sqlite3.Database,
        });

        console.log("Connected to SQLite database!");

        // Create book table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS book (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                author TEXT,
                price INTEGER,
                pages INTEGER
            );
        `);

        console.log("Book table created successfully!");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error(`Database error: ${error.message}`);
        process.exit(1);
    }
};

// Home route
app.get("/", (req, res) => {
    res.send("Book API is Running!");
});

// GET all books with search, sorting, pagination and price filters
app.get("/books/", async (req, res) => {
    try {
        const {
            search_q,
            order_by = "id",
            order = "ASC",
            limit = "10",
            offset = "0",
            min_price,
            max_price
        } = req.query;

        // Validate sorting column
        const allowedColumns = ["id", "title", "author", "price", "pages"];

        if (!allowedColumns.includes(order_by)) {
            return res.status(400).json({
                message: "Invalid order_by value"
            });
        }

        // Validate sorting order
        const sortOrder = order.toUpperCase();

        if (!["ASC", "DESC"].includes(sortOrder)) {
            return res.status(400).json({
                message: "Invalid order value. Use ASC or DESC"
            });
        }

        // Validate limit and offset
        const pageLimit = Number(limit);
        const pageOffset = Number(offset);

        if (
            !Number.isInteger(pageLimit) ||
            pageLimit < 1 ||
            !Number.isInteger(pageOffset) ||
            pageOffset < 0
        ) {
            return res.status(400).json({
                message: "Limit must be a positive integer and offset must be a non-negative integer"
            });
        }

        let query = "SELECT * FROM book";
        const conditions = [];
        const parameters = [];

        // Search books by partial title
        if (search_q !== undefined && search_q.trim() !== "") {
            conditions.push("title LIKE ?");
            parameters.push(`%${search_q.trim()}%`);
        }

        // Filter by minimum price
        if (min_price !== undefined) {
            const minPrice = Number(min_price);

            if (!Number.isFinite(minPrice)) {
                return res.status(400).json({
                    message: "min_price must be a number"
                });
            }

            conditions.push("price >= ?");
            parameters.push(minPrice);
        }

        // Filter by maximum price
        if (max_price !== undefined) {
            const maxPrice = Number(max_price);

            if (!Number.isFinite(maxPrice)) {
                return res.status(400).json({
                    message: "max_price must be a number"
                });
            }

            conditions.push("price <= ?");
            parameters.push(maxPrice);
        }

        // Check price range
        if (min_price !== undefined && max_price !== undefined) {
            if (Number(min_price) > Number(max_price)) {
                return res.status(400).json({
                    message: "min_price cannot be greater than max_price"
                });
            }
        }

        // Add WHERE clause when filters exist
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        // Sorting column and direction are allowlisted above
        query += ` ORDER BY ${order_by} ${sortOrder}`;

        // Pagination
        query += " LIMIT ? OFFSET ?";
        parameters.push(pageLimit, pageOffset);

        const books = await db.all(query, parameters);

        res.status(200).json(books);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET a book by ID
app.get("/books/:bookId/", async (req, res) => {
    try {
        const { bookId } = req.params;

        const book = await db.get(
            "SELECT * FROM book WHERE id = ?",
            [bookId]
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json(book);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// POST a new book with validation
app.post("/books/", async (req, res) => {
    try {
        const { title, author, price, pages } = req.body;

        // Validate required fields
        if (
            typeof title !== "string" ||
            title.trim() === "" ||
            typeof author !== "string" ||
            author.trim() === "" ||
            typeof price !== "number" ||
            !Number.isFinite(price)
        ) {
            return res.status(400).json({
                message: "Title and author are required, and price must be a number"
            });
        }

        // Validate pages if provided
        if (
            pages !== undefined &&
            (!Number.isInteger(pages) || pages <= 0)
        ) {
            return res.status(400).json({
                message: "Pages must be a positive integer"
            });
        }

        const result = await db.run(
            `INSERT INTO book (title, author, price, pages)
             VALUES (?, ?, ?, ?)`,
            [title.trim(), author.trim(), price, pages ?? null]
        );

        res.status(201).json({
            message: "Book added successfully",
            bookId: result.lastID
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// PUT update a book
app.put("/books/:bookId/", async (req, res) => {
    try {
        const { title, author, price, pages } = req.body;
        const { bookId } = req.params;

        // Validate update data
        if (
            typeof title !== "string" ||
            title.trim() === "" ||
            typeof author !== "string" ||
            author.trim() === "" ||
            typeof price !== "number" ||
            !Number.isFinite(price)
        ) {
            return res.status(400).json({
                message: "Title and author are required, and price must be a number"
            });
        }

        if (
            pages !== undefined &&
            (!Number.isInteger(pages) || pages <= 0)
        ) {
            return res.status(400).json({
                message: "Pages must be a positive integer"
            });
        }

        const result = await db.run(
            `UPDATE book
             SET title = ?, author = ?, price = ?, pages = ?
             WHERE id = ?`,
            [title.trim(), author.trim(), price, pages ?? null, bookId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// DELETE a book
app.delete("/books/:bookId/", async (req, res) => {
    try {
        const { bookId } = req.params;

        const result = await db.run(
            "DELETE FROM book WHERE id = ?",
            [bookId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Start the application
initializeDBAndServer();
