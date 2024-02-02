-- both test users have the password "password"

INSERT INTO users (email, name, password)
VALUES ('test1@test.com', 'Test1', '$2a$12$NA.fE/DXFjBNt6vNLavvxexvCkU/tR2ZtMq5qZ5NVHHatnuuDZY0a'),
        ('test2@test.com', 'Test2', '$2a$12$NA.fE/DXFjBNt6vNLavvxexvCkU/tR2ZtMq5qZ5NVHHatnuuDZY0a');