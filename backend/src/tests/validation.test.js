const request = require("supertest");
const app = require("../app");
const { connect, clearDatabase, closeDatabase } = require("./testDb");

// Setup and teardown - SINGLE connection for entire file
beforeAll(async () => {
    await connect();
});

afterEach(async () => {
    await clearDatabase();
});

afterAll(async () => {
    await closeDatabase();
});

describe("Validation Tests", () => {
    describe("Password Validation", () => {
        const baseUser = {
            fullName: "Test User",
            email: "test@example.com",
            confirmPassword: "password"
        };

        it("should reject password less than 8 characters", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    ...baseUser,
                    password: "Short1!",
                    confirmPassword: "Short1!"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors.some(e => e.message.includes("8 characters"))).toBe(true);
        });

        it("should reject password without uppercase", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    ...baseUser,
                    password: "lowercase123!",
                    confirmPassword: "lowercase123!"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toBeDefined();
        });

        it("should reject password without lowercase", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    ...baseUser,
                    password: "UPPERCASE123!",
                    confirmPassword: "UPPERCASE123!"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toBeDefined();
        });

        it("should reject password without number", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    ...baseUser,
                    password: "NoNumbers!",
                    confirmPassword: "NoNumbers!"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toBeDefined();
        });

        it("should reject password without special character", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    ...baseUser,
                    password: "NoSpecial123",
                    confirmPassword: "NoSpecial123"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toBeDefined();
        });

        it("should accept valid strong password", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    ...baseUser,
                    password: "ValidPass123!",
                    confirmPassword: "ValidPass123!"
                });

            expect(res.statusCode).toBe(201);
        });
    });

    describe("Email Validation", () => {
        const baseUser = {
            fullName: "Test User",
            password: "ValidPass123!",
            confirmPassword: "ValidPass123!"
        };

        it("should reject invalid email formats", async () => {
            const invalidEmails = [
                "notanemail",
                "@example.com",
                "user@",
                "user @example.com",
                "user@.com"
            ];

            for (const email of invalidEmails) {
                const res = await request(app)
                    .post("/api/auth/signup")
                    .send({
                        ...baseUser,
                        email
                    });

                expect(res.statusCode).toBe(400);
            }
        });

        it("should accept valid email formats", async () => {
            const validEmails = [
                "user@example.com",
                "user.name@example.com",
                "user+tag@example.co.uk",
                "user123@test-domain.com"
            ];

            for (const email of validEmails) {
                await clearDatabase(); // Clear between tests
                const res = await request(app)
                    .post("/api/auth/signup")
                    .send({
                        ...baseUser,
                        email
                    });

                expect(res.statusCode).toBe(201);
            }
        });

        it("should normalize email to lowercase", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    ...baseUser,
                    email: "USER@EXAMPLE.COM"
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.user.email).toBe("user@example.com");
        });
    });

    describe("Full Name Validation", () => {
        const baseUser = {
            email: "test@example.com",
            password: "ValidPass123!",
            confirmPassword: "ValidPass123!"
        };

        it("should reject empty full name", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    ...baseUser,
                    fullName: ""
                });

            expect(res.statusCode).toBe(400);
        });

        it("should reject full name less than 2 characters", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    ...baseUser,
                    fullName: "A"
                });

            expect(res.statusCode).toBe(400);
        });

        it("should accept valid full names", async () => {
            const validNames = [
                "John Doe",
                "María García",
                "李明",
                "O'Brien"
            ];

            for (const fullName of validNames) {
                await clearDatabase();
                const res = await request(app)
                    .post("/api/auth/signup")
                    .send({
                        ...baseUser,
                        fullName,
                        email: `test${Math.random()}@example.com`
                    });

                expect(res.statusCode).toBe(201);
            }
        });
    });
});

describe("Error Handling Tests", () => {
    describe("404 Errors", () => {
        it("should return 404 for non-existent routes", async () => {
            const res = await request(app)
                .get("/api/nonexistent");

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("not found");
        });
    });

    describe("Authentication Errors", () => {
        it("should return 401 for expired/invalid token", async () => {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", "Bearer invalid.token.here");

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 401 for missing token", async () => {
            const res = await request(app)
                .get("/api/auth/me");

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe("Validation Error Format", () => {
        it("should return consistent error format", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send({
                    fullName: "A",
                    email: "invalid",
                    password: "weak",
                    confirmPassword: "weak"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("success", false);
            expect(res.body).toHaveProperty("message");
            expect(res.body).toHaveProperty("errors");
            expect(Array.isArray(res.body.errors)).toBe(true);
            expect(res.body.errors[0]).toHaveProperty("field");
            expect(res.body.errors[0]).toHaveProperty("message");
        });
    });
});

describe("Integration Tests", () => {
    it("should complete full user lifecycle", async () => {
        // 1. Signup
        const signupRes = await request(app)
            .post("/api/auth/signup")
            .send({
                fullName: "Test User",
                email: "test@example.com",
                password: "TestPass123!",
                confirmPassword: "TestPass123!"
            });

        expect(signupRes.statusCode).toBe(201);
        const token = signupRes.body.token;

        // 2. Get current user
        const meRes = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(meRes.statusCode).toBe(200);

        // 3. Update profile
        const updateRes = await request(app)
            .put("/api/users/me")
            .set("Authorization", `Bearer ${token}`)
            .send({
                fullName: "Updated Name"
            });

        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.user.fullName).toBe("Updated Name");

        // 4. Change password
        const passwordRes = await request(app)
            .put("/api/users/me/password")
            .set("Authorization", `Bearer ${token}`)
            .send({
                oldPassword: "TestPass123!",
                newPassword: "NewTestPass456!",
                confirmPassword: "NewTestPass456!"
            });

        expect(passwordRes.statusCode).toBe(200);

        // 5. Login with new password
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test@example.com",
                password: "NewTestPass456!"
            });

        expect(loginRes.statusCode).toBe(200);

        // 6. Logout
        const logoutRes = await request(app)
            .post("/api/auth/logout");

        expect(logoutRes.statusCode).toBe(200);
    });
});
