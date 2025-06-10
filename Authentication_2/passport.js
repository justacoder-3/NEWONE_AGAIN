// passport-local strategy
const router = require('express').Router();
const passport = require('passport');
const { hashPassword } = require('./password.js');
const { User } = require('./db.js');
const { isAuth, /*isAdmin*/ } = require('./middleware.js');

// register
router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    try {
        const exists = await User.findOne({ username: username });
        if (exists) {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }

        const hashed = await hashPassword(password);

        const newUser = new User({
            username: username,
            password: hashed,
            role : 'user'
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Registered successfully',
        });
    } 
    catch (err) {
        next(err);
    }
});

// login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ success: false, message: info.message || 'Login failed' });
        }

        req.login(user, (err) => {
            if (err) return next(err);
            res.json({
                success: true,
                message: 'Login successful',
                user: { username: user.username, admin: user.admin }
            });
        });
    })(req, res, next);
});

// routes
router.get('/', (req, res) => {
    const user = req.user;
    res.send(`
        <h1>Welcome</h1>
        ${user ? `<p>Hey, ${user.username}!</p><a href="/logout">Logout</a>` :
                 `<p><a href="/register">Register</a> | <a href="/login">Login</a></p>`}
    `);
});

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/');
    res.send(`
        <form method="POST" action="/login">
            <input name="username" required placeholder="Username" />
            <input name="password" type="password" required placeholder="Password" />
            <button type="submit">Login</button>
        </form>
    `);
});

router.get('/register', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/');
    res.send(`
        <form method="POST" action="/register">
            <input name="username" required placeholder="Username" />
            <input name="password" type="password" required placeholder="Password" minlength="6" />
            <button type="submit">Register</button>
        </form>
    `);
});

router.get('/resource', isAuth, (req, res) => {
    res.send(`<h1>Resource</h1><p>Hi ${req.user.username}, Logged in</p>`);
});

// router.get('/admin-route', isAdmin, (req, res) => {
//     res.send(`<h1>Admin</h1><p>Welcome Admin ${req.user.username}</p>`);
// }); (used in future if required)

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.session.destroy((err) => {
            if (err) return next(err);

            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    });
});

module.exports = router;
