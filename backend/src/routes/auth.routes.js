const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateSignup, validateLogin } = require("../middleware/validators");

router.post("/signup", validateSignup, auth.signup);
router.post("/login", validateLogin, auth.login);
router.post("/logout", auth.logout);
router.get("/me", authMiddleware, auth.me);

module.exports = router;