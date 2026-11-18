
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const db = new sqlite3.Database("./userDatabase.db");

const JWT_SECRET = "my_secret_key";


db.run(`
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
`);


app.post("/register/", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error_msg: "Username and password are required"
        });
    }

    db.get(
        "SELECT * FROM user WHERE username = ?",
        [username],
        async (err, user) => {
            if (err) {
                return res.status(500).json({
                    error_msg: "Database error"
                });
            }

            if (user) {
                return res.status(400).json({
                    error_msg: "User already exists"
                });
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);

                db.run(
                    "INSERT INTO user (username, password) VALUES (?, ?)",
                    [username, hashedPassword],
                    function (err) {
                        if (err) {
                            return res.status(500).json({
                                error_msg: "Unable to register user"
                            });
                        }

                        return res.status(201).json({
                            message: "User created successfully"
                        });
                    }
                );
            } catch (error) {
                return res.status(500).json({
                    error_msg: "Password hashing failed"
                });
            }
        }
    );
});


app.post("/login/", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error_msg: "Username and password are required"
        });
    }

    db.get(
        "SELECT * FROM user WHERE username = ?",
        [username],
        async (err, user) => {
            if (err) {
                return res.status(500).json({
                    error_msg: "Database error"
                });
            }

            if (!user) {
                return res.status(400).json({
                    error_msg: "Invalid user"
                });
            }

            const isPasswordCorrect = await bcrypt.compare(
                password,
                user.password
            );

            if (!isPasswordCorrect) {
                return res.status(400).json({
                    error_msg: "Invalid password"
                });
            }

            const token = jwt.sign(
                { username: username },
                JWT_SECRET
            );

            return res.status(200).json({
                jwt_token: token
            });
        }
    );
});

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
