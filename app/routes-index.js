module.exports = {
    v1routes: function (app) {
        app.use('/api/v1/auth', require('./auth/auth.route'));
        //app.use('/api/v1/admin', require('./admin/admin.route'));
    }
};
