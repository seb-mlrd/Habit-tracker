// Use an in-memory SQLite DB for tests
process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test_secret';
process.env.PORT = '3099';
