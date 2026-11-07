
const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
const PORT = 3000;

app.use(express.json());

let db;

// Initialize database and start server
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: "./bookStore.db",
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

// Get all books
app.get("/books/", async (req, res) => {
    try {
        const books = await db.all("SELECT * FROM book");
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a book by ID
app.get("/books/:bookId/", async (req, res) => {
    try {
        const { bookId } = req.params;

        const book = await db.get(
            "SELECT * FROM book WHERE id = ?",
            [bookId]
        );

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new book
app.post("/books/", async (req, res) => {
    try {
        const { title, author, price, pages } = req.body;

        const result = await db.run(
            `INSERT INTO book (title, author, price, pages)
             VALUES (?, ?, ?, ?)`,
            [title, author, price, pages]
        );

        res.status(201).json({
            message: "Book added successfully",
            bookId: result.lastID
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a book
app.put("/books/:bookId/", async (req, res) => {
    try {
        const { title, author, price, pages } = req.body;
        const { bookId } = req.params;

        const result = await db.run(
            `UPDATE book
             SET title = ?, author = ?, price = ?, pages = ?
             WHERE id = ?`,
            [title, author, price, pages, bookId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json({ message: "Book updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a book
app.delete("/books/:bookId/", async (req, res) => {
    try {
        const { bookId } = req.params;

        const result = await db.run(
            "DELETE FROM book WHERE id = ?",
            [bookId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start database initialization
initializeDBAndServer();
