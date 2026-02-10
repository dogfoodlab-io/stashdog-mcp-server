import { StashDogClient } from '../src/client.js';

const createToken = (sub: string) => {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub })).toString('base64url');
  return `${header}.${payload}.signature`;
};

describe('StashDogClient', () => {
  const supabaseUrl = 'http://localhost:54321';
  const anonKey = 'anon-key';

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('signIn calls Supabase auth endpoint', async () => {
    const client = new StashDogClient({ supabaseUrl, anonKey });
    const mockResponse = {
      access_token: 'access-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        user_metadata: { displayName: 'User' }
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      statusText: 'OK',
      text: async () => JSON.stringify(mockResponse),
      headers: new Headers()
    });

    const result = await client.signIn('user@example.com', 'password');

    expect(result.accessToken).toBe('access-token');
    expect(result.user.email).toBe('user@example.com');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${supabaseUrl}/auth/v1/token?grant_type=password`);
    expect(options?.method).toBe('POST');
    expect(options?.headers).toMatchObject({ apikey: anonKey });
  });

  test('getItems adds search and tag filters', async () => {
    const token = createToken('user-123');
    const client = new StashDogClient({ supabaseUrl, anonKey, authToken: token });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      statusText: 'OK',
      text: async () => JSON.stringify([]),
      headers: new Headers({ 'content-range': '0-0/0' })
    });

    await client.getItems({ search: 'camera', tags: ['photo', 'gear'], limit: 5, offset: 10 });

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    const parsed = new URL(url as string);

    expect(parsed.pathname).toBe('/rest/v1/items');
    expect(parsed.searchParams.get('or')).toContain('name.ilike.*camera*');
    expect(parsed.searchParams.get('tags')).toBe('cs.{photo,gear}');
    expect(parsed.searchParams.get('limit')).toBe('5');
    expect(parsed.searchParams.get('offset')).toBe('10');
    expect(options?.headers).toMatchObject({
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
      Prefer: 'count=exact'
    });
  });

  test('createCollection uses user id from token', async () => {
    const token = createToken('user-abc');
    const client = new StashDogClient({ supabaseUrl, anonKey, authToken: token });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      statusText: 'OK',
      text: async () => JSON.stringify([
        {
          id: 'collection-1',
          name: 'Home',
          user_id: 'user-abc',
          visibility: 'private',
          created_at: '2025-01-01',
          updated_at: '2025-01-02'
        }
      ]),
      headers: new Headers()
    });

    const result = await client.createCollection({ name: 'Home' });
    expect(result?.userId).toBe('user-abc');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options?.body as string);
    expect(body.user_id).toBe('user-abc');
  });

  test('addItem maps description to notes', async () => {
    const token = createToken('user-abc');
    const client = new StashDogClient({ supabaseUrl, anonKey, authToken: token });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      statusText: 'OK',
      text: async () => JSON.stringify([
        {
          id: 'item-1',
          name: 'Tripod',
          description: 'Carbon fiber',
          tags: ['photo'],
          isStorage: false,
          isClassified: false,
          isFavorited: false,
          containerId: null,
          customFields: [],
          images: []
        }
      ]),
      headers: new Headers()
    });

    const result = await client.addItem({ name: 'Tripod', notes: 'Carbon fiber' });
    expect(result?.notes).toBe('Carbon fiber');
  });
});
