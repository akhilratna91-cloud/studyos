process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';

const mockVerifyIdToken = jest.fn();

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

const request = require('supertest');

const app = require('../src/app');
const User = require('../src/modules/user/user.model');
const Profile = require('../src/modules/profile/profile.model');

describe('StudyOS Google authentication', () => {
  beforeEach(() => {
    mockVerifyIdToken.mockReset();
  });

  it('creates a new StudyOS account from a verified Google credential', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-user-001',
        email: 'scholar.google@example.com',
        email_verified: true,
        name: 'Scholar Google',
        picture: 'https://example.com/avatar.png',
      }),
    });

    const response = await request(app).post('/api/v1/auth/google').send({
      credential: 'valid-google-token',
      class: '12',
      exam: 'JEE Main',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('scholar.google@example.com');
    expect(response.body.data.profile.displayName).toBe('Scholar Google');
    expect(response.body.data.accessToken).toBeTruthy();

    const user = await User.findOne({ email: 'scholar.google@example.com' }).lean();
    const profile = await Profile.findOne({ userId: user._id }).lean();

    expect(user.googleId).toBe('google-user-001');
    expect(user.authProvider).toBe('google');
    expect(user.emailVerified).toBe(true);
    expect(profile.displayName).toBe('Scholar Google');
  });

  it('links Google sign-in to an existing local account with the same email', async () => {
    const existingUser = await User.create({
      email: 'linked.student@example.com',
      password: 'Password1!',
      class: '12',
      exam: 'NEET',
    });

    await Profile.create({
      userId: existingUser._id,
      class: '12',
      exam: 'NEET',
      displayName: '',
    });

    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-user-002',
        email: 'linked.student@example.com',
        email_verified: true,
        name: 'Linked Student',
      }),
    });

    const response = await request(app).post('/api/v1/auth/google').send({
      credential: 'valid-google-token',
      class: '11',
      exam: 'JEE Main',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('linked.student@example.com');
    expect(response.body.data.profile.displayName).toBe('Linked Student');

    const updatedUser = await User.findOne({
      email: 'linked.student@example.com',
    }).lean();

    expect(updatedUser.googleId).toBe('google-user-002');
    expect(updatedUser.authProvider).toBe('google');
    expect(updatedUser.class).toBe('12');
    expect(updatedUser.exam).toBe('NEET');
  });

  it('rejects password login for a Google-only account', async () => {
    await User.create({
      email: 'google.only@example.com',
      class: '10',
      exam: 'Boards',
      googleId: 'google-user-003',
      authProvider: 'google',
      emailVerified: true,
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'google.only@example.com',
      password: 'Password1!',
    });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('GOOGLE_ACCOUNT_USE_GOOGLE_SIGNIN');
  });
});
