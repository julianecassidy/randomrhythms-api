\echo 'Delete and recreate randomrhythms db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE randomrhythms;
CREATE DATABASE randomrhythms;
\connect randomrhythms

\i randomrhythms-schema.sql
\i randomrhythms-seed.sql

\echo 'Delete and recreate randomrhythms_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE randomrhythms_test;
CREATE DATABASE randomrhythms_test;
\connect randomrhythms_test

\i randomrhythms-schema.sql
