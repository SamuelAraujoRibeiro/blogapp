module.exports = {
    eAdmin: function(req, res, next) {
        if(req.isAuthenticated() && req.user.eAdmin == 1) {
            return next()
        }
        else {
            req.flash('error_msg', 'Você precisa ter acesso de administrador para acessar essa página')
            res.redirect('/')
        }
    }
}