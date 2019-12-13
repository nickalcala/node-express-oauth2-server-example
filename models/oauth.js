const mongoose = require('mongoose');

let OAuthAccessTokenModel = mongoose.model('OAuthAccessToken', new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthClient' },
    accessToken: { type: String },
    accessTokenExpiresAt: { type: Date },
    refreshToken: { type: String },
    refreshTokenExpiresAt: { type: Date },
    scope: { type: String }
}, {
    timestamps: true
}), 'oauth_access_tokens');

let OAuthCodeModel = mongoose.model('OAuthCode', new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthClient' },
    authorizationCode: { type: String },
    expiresAt: { type: Date },
    scope: { type: String }
}, {
    timestamps: true
}), 'oauth_auth_codes');

let OAuthClientModel = mongoose.model('OAuthClient', new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    clientId: { type: String },
    clientSecret: { type: String },
    redirectUris: { type: Array },
    grants: { type: Array },
}, {
    timestamps: true
}), 'oauth_clients');

module.exports.getAccessToken = async (accessToken) => {

    let _accessToken = await OAuthAccessTokenModel.findOne({ accessToken: accessToken })
        .populate('user')
        .populate('client');

    if (!_accessToken) {
        return false;
    }

    _accessToken = _accessToken.toObject();

    if (!_accessToken.user) {
        _accessToken.user = {};
    }
    return _accessToken;
};

module.exports.getRefreshToken = (refreshToken) => {
    return OAuthAccessTokenModel.findOne({ refreshToken: refreshToken })
        .populate('user')
        .populate('client');
};

module.exports.getAuthorizationCode = (code) => {
    return OAuthCodeModel.findOne({ authorizationCode: code })
        .populate('user')
        .populate('client');
};

module.exports.getClient = (clientId, clientSecret) => {
    let params = { clientId: clientId };
    if (clientSecret) {
        params.clientSecret = clientSecret;
    }
    return OAuthClientModel.findOne(params);
};

module.exports.getUser = async (username, password) => {
    let UserModel = mongoose.model('User');
    let user = await UserModel.findOne({ username: username });
    if (user.validatePassword(password)) {
        return user;
    }
    return false;
};

module.exports.getUserFromClient = (client) => {
    // let UserModel = mongoose.model('User');
    // return UserModel.findById(client.user);
    return {};
};

module.exports.saveToken = async (token, client, user) => {
    let accessToken = (await OAuthAccessTokenModel.create({
        user: user.id || null,
        client: client.id,
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        scope: token.scope,
    })).toObject();

    if (!accessToken.user) {
        accessToken.user = {};
    }

    return accessToken;
};

module.exports.saveAuthorizationCode = (code, client, user) => {
    let authCode = new OAuthCodeModel({
        user: user.id,
        client: client.id,
        authorizationCode: code.authorizationCode,
        expiresAt: code.expiresAt,
        scope: code.scope
    });
    return authCode.save();
};

module.exports.revokeToken = async (accessToken) => {
    let result = await OAuthAccessTokenModel.deleteOne({
        refreshToken: accessToken.refreshToken
    });
    return result.deletedCount > 0;
};

module.exports.revokeAuthorizationCode = async (code) => {
    let result = await OAuthCodeModel.deleteOne({
        authorizationCode: code.authorizationCode
    });
    return result.deletedCount > 0;
};