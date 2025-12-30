const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const { connect, clearDatabase, closeDatabase } = require("./testDb");

// Setup and teardown
beforeAll(async () => {
    await connect();
});

afterEach(async () => {
    await clearDatabase();
});

afterAll(async () => {
    await closeDatabase();
});

describe("Auth Endpoints", () => {
    describe("POST /api/auth/signup", () => {
        const validUser = {
            fullName: "John Doe",
            email: "john@example.com",
            password: "SecurePass123!",
            confirmPassword: "SecurePass123!"
        };

        it("should create a new user with valid data", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send(validUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Signup successful");
            expect(res.body.token).toBeDefined();
            expect(res.body.user).toHaveProperty("id");
            expect(res.body.user.email).toBe(validUser.email);
            expect(res.body.user.fullName).toBe(validUser.fullName);
            expect(res.body.user.role).toBe("user");
            expect(res.body.user.status).toBe("active");
            expect(res.body.user.password).toBeUndefined();
        });

        it("should return 400 for weak password", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    ...validUser,
                    password: "weak",
                    confirmPassword: "weak"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Validation failed");
            expect(res.body.errors).toBeDefined();
        });

        it("should return 400 for invalid email", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    ...validUser,
                    email: "invalid-email"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 when passwords don't match", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    ...validUser,
                    confirmPassword: "DifferentPass123!"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 for missing fullName", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    email: validUser.email,
                    password: validUser.password,
                    confirmPassword: validUser.confirmPassword
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 409 for duplicate email", async () => {
            // Create first user
            await request(app)
                .post("/api/auth/signup")
                .send(validUser);

            // Try to create duplicate
            const res = await request(app)
                .post("/api/auth/signup")
                .send(validUser);

            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Email already registered");
        });
    });

    describe("POST /api/auth/login", () => {
        const userData = {
            fullName: "John Doe",
            email: "john@example.com",
            password: "SecurePass123!",
            confirmPassword: "SecurePass123!"
        };

        beforeEach(async () => {
            // Create a user before each login test
            await request(app)
                .post("/api/auth/signup")
                .send(userData);
        });

        it("should login with valid credentials", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: userData.email,
                    password: userData.password
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Login successful");
            expect(res.body.token).toBeDefined();
            expect(res.body.user).toHaveProperty("id");
            expect(res.body.user.email).toBe(userData.email);
        });

        it("should return 401 for wrong password", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: userData.email,
                    password: "WrongPassword123!"
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Invalid email or password");
        });

        it("should return 401 for non-existent user", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "nonexistent@example.com",
                    password: userData.password
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 for invalid email format", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "invalid-email",
                    password: userData.password
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 403 for inactive user", async () => {
            // Deactivate user
            await User.findOneAndUpdate(
                { email: userData.email },
                { status: "inactive" }
            );

            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: userData.email,
                    password: userData.password
                });

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("inactive");
        });

        it("should update lastLogin on successful login", async () => {
            const beforeLogin = await User.findOne({ email: userData.email });
            expect(beforeLogin.lastLogin).toBeUndefined();

            await request(app)
                .post("/api/auth/login")
                .send({
                    email: userData.email,
                    password: userData.password
                });

            const afterLogin = await User.findOne({ email: userData.email });
            expect(afterLogin.lastLogin).toBeDefined();
        });
    });

    describe("GET /api/auth/me", () => {
        let token;
        const userData = {
            fullName: "John Doe",
            email: "john@example.com",
            password: "SecurePass123!",
            confirmPassword: "SecurePass123!"
        };

        beforeEach(async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send(userData);
            token = res.body.token;
        });

        it("should return user data with valid token", async () => {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toHaveProperty("id");
            expect(res.body.user.email).toBe(userData.email);
            expect(res.body.user.fullName).toBe(userData.fullName);
            expect(res.body.user.password).toBeUndefined();
        });

        it("should return 401 without token", async () => {
            const res = await request(app)
                .get("/api/auth/me");

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 401 with invalid token", async () => {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", "Bearer invalid-token");

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe("POST /api/auth/logout", () => {
        it("should logout successfully", async () => {
            const res = await request(app)
                .post("/api/auth/logout");

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain("Logged out");
        });
    });
});
