const router = require('express').Router();

router.get('/profile', (req, res) => {
    return res.render('secured', { token: JSON.stringify(res.locals) });
});

module.exports = router;