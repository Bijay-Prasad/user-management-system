const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const bcrypt = require("bcrypt");
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

describe("User Management Endpoints", () => {
    let userToken;
    let adminToken;
    let userId;
    let adminId;

    beforeEach(async () => {
        // Create regular user
        const userRes = await request(app)
            .post("/api/auth/signup")
            .send({
                fullName: "Regular User",
                email: "user@example.com",
                password: "UserPass123!",
                confirmPassword: "UserPass123!"
            });
        userToken = userRes.body.token;
        userId = userRes.body.user.id;

        // Create admin user
        const hashedPassword = await bcrypt.hash("AdminPass123!", 10);
        const admin = await User.create({
            fullName: "Admin User",
            email: "admin@example.com",
            password: hashedPassword,
            role: "admin"
        });
        adminId = admin._id.toString();

        // Login as admin to get token
        const adminLoginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: "admin@example.com",
                password: "AdminPass123!"
            });
        adminToken = adminLoginRes.body.token;
    });

    describe("GET /api/users", () => {
        it("should return all users with pagination (admin)", async () => {
            const res = await request(app)
                .get("/api/users?page=1&limit=10")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.users).toBeDefined();
            expect(Array.isArray(res.body.users)).toBe(true);
            expect(res.body.pagination).toBeDefined();
            expect(res.body.pagination.total).toBeGreaterThan(0);
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.limit).toBe(10);
        });

        it("should return 403 for non-admin user", async () => {
            const res = await request(app)
                .get("/api/users")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("should return 401 without token", async () => {
            const res = await request(app)
                .get("/api/users");

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should handle pagination correctly", async () => {
            // Create more users
            for (let i = 0; i < 15; i++) {
                await User.create({
                    fullName: `User ${i}`,
                    email: `user${i}@example.com`,
                    password: await bcrypt.hash("Pass123!", 10)
                });
            }

            const res = await request(app)
                .get("/api/users?page=2&limit=5")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.users.length).toBeLessThanOrEqual(5);
            expect(res.body.pagination.page).toBe(2);
            expect(res.body.pagination.hasNextPage).toBeDefined();
            expect(res.body.pagination.hasPrevPage).toBe(true);
        });
    });

    describe("PATCH /api/users/:id/status", () => {
        it("should toggle user status (admin)", async () => {
            const res = await request(app)
                .patch(`/api/users/${userId}/status`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain("deactivated");
            expect(res.body.user.status).toBe("inactive");

            // Toggle back
            const res2 = await request(app)
                .patch(`/api/users/${userId}/status`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res2.statusCode).toBe(200);
            expect(res2.body.user.status).toBe("active");
        });

        it("should return 403 for non-admin user", async () => {
            const res = await request(app)
                .patch(`/api/users/${adminId}/status`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it("should return 404 for non-existent user", async () => {
            const fakeId = "507f1f77bcf86cd799439011";
            const res = await request(app)
                .patch(`/api/users/${fakeId}/status`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it("should prevent admin from deactivating themselves", async () => {
            const res = await request(app)
                .patch(`/api/users/${adminId}/status`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("cannot change your own");
        });
    });

    describe("PUT /api/users/me", () => {
        it("should update user profile", async () => {
            const res = await request(app)
                .put("/api/users/me")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    fullName: "Updated Name"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain("updated");
            expect(res.body.user.fullName).toBe("Updated Name");
        });

        it("should update email", async () => {
            const res = await request(app)
                .put("/api/users/me")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    email: "newemail@example.com"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.user.email).toBe("newemail@example.com");
        });

        it("should return 409 for duplicate email", async () => {
            const res = await request(app)
                .put("/api/users/me")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    email: "admin@example.com" // Already exists
                });

            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("already in use");
        });

        it("should return 400 for invalid email", async () => {
            const res = await request(app)
                .put("/api/users/me")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    email: "invalid-email"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should prevent role modification", async () => {
            const res = await request(app)
                .put("/api/users/me")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    role: "admin"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should prevent status modification", async () => {
            const res = await request(app)
                .put("/api/users/me")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    status: "inactive"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("PUT /api/users/me/password", () => {
        it("should change password with correct old password", async () => {
            const res = await request(app)
                .put("/api/users/me/password")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    oldPassword: "UserPass123!",
                    newPassword: "NewUserPass456!",
                    confirmPassword: "NewUserPass456!"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain("changed");

            // Verify can login with new password
            const loginRes = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "user@example.com",
                    password: "NewUserPass456!"
                });

            expect(loginRes.statusCode).toBe(200);
        });

        it("should return 401 for wrong old password", async () => {
            const res = await request(app)
                .put("/api/users/me/password")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    oldPassword: "WrongPassword123!",
                    newPassword: "NewUserPass456!",
                    confirmPassword: "NewUserPass456!"
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("incorrect");
        });

        it("should return 400 for weak new password", async () => {
            const res = await request(app)
                .put("/api/users/me/password")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    oldPassword: "UserPass123!",
                    newPassword: "weak",
                    confirmPassword: "weak"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 when passwords don't match", async () => {
            const res = await request(app)
                .put("/api/users/me/password")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    oldPassword: "UserPass123!",
                    newPassword: "NewUserPass456!",
                    confirmPassword: "DifferentPass456!"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 when new password same as old", async () => {
            const res = await request(app)
                .put("/api/users/me/password")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    oldPassword: "UserPass123!",
                    newPassword: "UserPass123!",
                    confirmPassword: "UserPass123!"
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});
