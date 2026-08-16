import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

// Requires the dev Docker Compose stack (mongo + redis) running locally —
// see DEPLOYMENT.md "Development — Run Instructions". This is the
// integration-level test referenced in TEST_PLAN.md's "auth flow" journey.
describe("Auth flow (e2e)", () => {
  let app: INestApplication;
  const email = `e2e-${Date.now()}@ioma-test.com`;
  const password = "SuperSecret123";
  let refreshToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("registers a new user", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email, password, firstName: "E2E", lastName: "Test" })
      .expect(201);

    expect(res.body.user.email).toBe(email);
    expect(res.body.accessToken).toBeDefined();
    refreshToken = res.body.refreshToken;
  });

  it("rejects a duplicate registration", async () => {
    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email, password, firstName: "E2E", lastName: "Test" })
      .expect(409);
  });

  it("logs in with the correct credentials", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email, password })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    refreshToken = res.body.refreshToken;
  });

  it("rejects login with a wrong password", async () => {
    await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email, password: "WrongPassword1" })
      .expect(401);
  });

  it("rotates the refresh token", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/refresh")
      .send({ refreshToken })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(refreshToken);
    refreshToken = res.body.refreshToken;
  });

  it("rejects reuse of a rotated-out refresh token", async () => {
    const staleToken = refreshToken;
    // Rotate once more so `staleToken` is now the "used" one.
    const rotated = await request(app.getHttpServer())
      .post("/api/auth/refresh")
      .send({ refreshToken: staleToken })
      .expect(200);
    refreshToken = rotated.body.refreshToken;

    // Replaying the already-rotated token must fail.
    await request(app.getHttpServer())
      .post("/api/auth/refresh")
      .send({ refreshToken: staleToken })
      .expect(401);
  });

  it("logs out and revokes the session", async () => {
    await request(app.getHttpServer())
      .post("/api/auth/logout")
      .send({ refreshToken })
      .expect(204);

    await request(app.getHttpServer())
      .post("/api/auth/refresh")
      .send({ refreshToken })
      .expect(401);
  });
});
