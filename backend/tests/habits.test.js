const request = require('supertest');
const app = require('../src/app');

let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'habits@example.com', password: 'pass123' });
  token = res.body.token;
});

function auth() {
  return { Authorization: `Bearer ${token}` };
}

describe('GET /api/habits', () => {
  it('requires auth', async () => {
    const res = await request(app).get('/api/habits');
    expect(res.status).toBe(401);
  });

  it('returns empty array for new user', async () => {
    const res = await request(app).get('/api/habits').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/habits', () => {
  it('creates a habit', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set(auth())
      .send({ name: 'Morning run', category: 'sport', frequency: 'daily' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Morning run');
    expect(res.body.category).toBe('sport');
    expect(res.body.streak).toBe(0);
  });

  it('rejects missing name', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set(auth())
      .send({ category: 'sport' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/habits/:id', () => {
  let habitId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/habits')
      .set(auth())
      .send({ name: 'Read', category: 'learning' });
    habitId = res.body.id;
  });

  it('updates a habit', async () => {
    const res = await request(app)
      .put(`/api/habits/${habitId}`)
      .set(auth())
      .send({ name: 'Read books', category: 'productivity' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Read books');
    expect(res.body.category).toBe('productivity');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .put('/api/habits/99999')
      .set(auth())
      .send({ name: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/habits/:id', () => {
  it('deletes a habit', async () => {
    const create = await request(app)
      .post('/api/habits')
      .set(auth())
      .send({ name: 'To delete' });

    const del = await request(app)
      .delete(`/api/habits/${create.body.id}`)
      .set(auth());

    expect(del.status).toBe(204);
  });
});

describe('Completions', () => {
  let habitId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/habits')
      .set(auth())
      .send({ name: 'Meditate' });
    habitId = res.body.id;
  });

  it('marks a habit complete', async () => {
    const res = await request(app)
      .post(`/api/completions/${habitId}/complete`)
      .set(auth())
      .send({ date: '2025-01-01' });

    expect(res.status).toBe(201);
    expect(res.body.completed_on).toBe('2025-01-01');
  });

  it('prevents duplicate completion', async () => {
    const res = await request(app)
      .post(`/api/completions/${habitId}/complete`)
      .set(auth())
      .send({ date: '2025-01-01' });

    expect(res.status).toBe(409);
  });

  it('returns completion history', async () => {
    const res = await request(app)
      .get(`/api/completions/${habitId}/history`)
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('removes a completion', async () => {
    const res = await request(app)
      .delete(`/api/completions/${habitId}/complete?date=2025-01-01`)
      .set(auth());

    expect(res.status).toBe(204);
  });
});
