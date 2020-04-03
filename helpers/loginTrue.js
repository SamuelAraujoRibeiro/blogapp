module.exports = {
    loginTrue: function(req, res, next) {
        if(req.isAuthenticated()) {
            req.flash('error_msg', 'Você já está logado')
            res.redirect('/')
        }
        else { 
            return next()
        }
    }
}