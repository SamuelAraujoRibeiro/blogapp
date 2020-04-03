// Carregando Módulos
    const express = require('express')
    const app = express()    
    const handlebars = require('handlebars')
    const exphbs = require('express-handlebars')
    const bodyParser = require('body-parser')    
    const admin = require('./routes/admin')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')
    const usuarios = require('./routes/usuario')
    const passport = require('passport')
    require('./config/auth')(passport)
    const db = require('./config/db')
// Configurações
    // Sessão
        app.use(session({
            secret: 'blogSamuel',
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg') // Variável Global
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null
            next()
        })
    // Body-Parser
        app.use(bodyParser.urlencoded( {extended: true}) )
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', exphbs())
        app.set('view engine', 'handlebars')
    // Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect(db.mongoURI, {
            useNewUrlParser:true, 
            useUnifiedTopology: true 
        }).then(() => {
            console.log('Conectado ao mongo!')
        }).catch((err) => {
            console.log('Erro ao conectar ao Mongo!' + err)
        })
    // Public
        app.use(express.static(path.join(__dirname, 'public'))) // Pegar todo o caminho, diminui erros
// Rotas
    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
            res.render('index', {postagens: postagens})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno!')
            res.redirect('/404')
        })
    })

    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem) {
                res.render('postagem/index', {postagem: postagem})
            }
            else {
                req.flash('error_msg', 'Esta postagem não existe!')
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno!')
            res.redirect('/')
        })
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render('categorias/index', {categorias: categorias})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao listar categorias!')
            res.redirect('/')
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria) {
                Postagem.find({categoria: categoria._id}).then((postagens) => {
                res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao listar os posts!')
                    res.redirect('/')
                })
            }
            else {
                req.flash('error_msg', 'Esta categoria não existe!')
                res.redirect('/categorias')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria!')
            req.redirect('/categorias')
        })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })

    app.use('/admin', admin) // Rota principal que vai ser usada antes de qualquer outra rota
    app.use('/usuarios', usuarios)
// Outros
const PORT = process.env.PORT || 8081 // Número da porta que queremos usar
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}...`)
})