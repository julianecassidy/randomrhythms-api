CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
    name VARCHAR(25),
    password TEXT NOT NULL
);