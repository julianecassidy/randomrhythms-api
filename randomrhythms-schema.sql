CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE
        CHECK (position('@' IN email) > 1),
    name VARCHAR(25),
    password TEXT NOT NULL
);