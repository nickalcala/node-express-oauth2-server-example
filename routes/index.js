const router = require('express').Router();
const OAuthServer = require('express-oauth-server');
const OAuthModel = require('../models/oauth');

let oauth = new OAuthServer({
    model: OAuthModel,
    useErrorHandler: true,
    debug: true
});

router.use(require('./oauth'));
router.use(require('./public'));
router.use('/account', oauth.authenticate(), (req, res) => {
    return res.json(res.locals.oauth.token.user);
});
router.use('/secured/profile', oauth.authenticate(), (req, res) => {
    return res.render('secured', { token: JSON.stringify(res.locals) });
});

module.exports = router;