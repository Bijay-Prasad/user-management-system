const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const user = require("../controllers/user.controller");
const { validateProfileUpdate, validatePasswordChange } = require("../middleware/validators");

router.get("/", auth, role("admin"), user.getAllUsers);
router.patch("/:id/status", auth, role("admin"), user.toggleStatus);
router.put("/me", auth, validateProfileUpdate, user.updateProfile);
router.put("/me/password", auth, validatePasswordChange, user.changePassword);

module.exports = router;