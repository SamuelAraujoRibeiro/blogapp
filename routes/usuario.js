const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
const bcrypt = require('bcryptjs')
const passport = require('passport')
const {loginTrue} = require('../helpers/loginTrue')
// Incluir model Usuario
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: 'Nome inválido!'})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: 'E-mail inválido!'})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: 'Senha inválida!'})
    }
    if(req.body.senha.length < 4) {
        erros.push({texto: 'Senha muito curta!'})
    }
    if(req.body.senha != req.body.senha1) {
        erros.push({texto: 'Senhas diferentes, tente novamente!'})
    }

    if(erros.length > 0) {
        res.render('usuarios/registro', {erros: erros})
    }
    else {
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario) {
                req.flash('error_msg', 'Já existe uma conta cadastrada com este email!')
                res.redirect('/usuarios/registro')
            }
            else {
                var novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                })
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro) {
                            console.log(erro)
                            req.flash('error_msg', 'Houve um erro durante o cadastramento do usuário!')  
                            res.redirect('/')
                        }
                        else {
                            novoUsuario.senha = hash

                            novoUsuario.save().then(() => {
                                req.flash('success_msg', 'Usuário cadastrado com sucesso!')
                                res.redirect('/')
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve um erro durante o cadastramento do usuário, tente novamente!')
                                console.log(err)
                                res.redirect('/usuarios/registro')
                            })
                        }
                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno!')
            res.redirect('/')
        })
    }
})

router.get('/login', loginTrue, (req, res) => {
    if(req.usuario){
        req.flash("error_msg", "Você já esta logado!");
        res.redirect("/");
    }
    else {
        res.render('usuarios/login')        
    }
})

router.post('/login', loginTrue, (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'Você deixou de sentir nostalgia!')
    res.redirect('/')
})
module.exports = router