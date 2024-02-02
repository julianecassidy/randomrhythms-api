-- both test users have the password "password"

INSERT INTO users (email, name, password)
VALUES ('test1@test.com', 'Test1', 'password',
        'test2@test.com', 'Test2', 'password');