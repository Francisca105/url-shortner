const express = require('express')
const app = express()
const db = require('./base de dados/db')
const Tabela = require('./base de dados/Tabela');
const PORT = process.env.PORT || 3000;
const https = require('https')
const fs = require('fs')
const baseURL = 'https://localhost:8880'

/**/
db.authenticate().then(() => {
    Tabela.init(db)
    Tabela.sync()
})
/**/

app.set('view-engine', 'ejs')
app.use('/', express.static('./public'))
app.use(express.urlencoded({
    extended: true
  }))
  
/**/

app.get('/', async (req, res) => {
    res.render('index.ejs', {msg: null, checklink: null})
})

app.get('/api/all', async (req, res) => {
    let findAll = await Tabela.findAll()
    let dados = findAll.map(links => {

        let response = {
            "link": links.link,
            "redirect": links.redirect,
            "clicks": links.clicks
        }
        return response
    })

    res.json({"total": findAll.length, dados })
})

app.get('/api/pesq/:link', async (req, res) => {
    let link = req.params.link

    let find = await Tabela.findOne({where: {link: link}}).catch(erro => {
        res.json({"err": erro})
    })
    if(!find) {
        res.json({ "err": "Não encontrado"})
    }
    res.json({ "link": find.link, "redirect": find.redirect, "clicks": find.clicks })
})

app.get('/api', async (req,res) => {
    res.render('docs.ejs')
})

app.get('/:link', async (req, res) => {
    let link = req.params.link
    if(!link) return;
    if(link === 'favicon.ico') return;

    let findL = await Tabela.findOne({where: {link: link}}).catch(erro => {
        res.render('404.ejs', {msg: erro})
    })

    if(!findL) res.redirect('/')
    res.redirect(findL.redirect)
    await findL.increment('clicks', {by: 1})
})

app.get('/link/:link', async (req, res) => {
    let link = req.params.link

    let find = await Tabela.findOne({where: {link: link}}).catch(erro => {
        res.render('404.ejs', {msg: erro})
    })
    if(!find) {
        res.render('404.ejs', {msg: 'Link não encontrado'})
    }
    res.render('link.ejs', {link: link ,clicks: find.clicks, redirect: find.redirect})
})
//

app.post('/action/criar',  async (req, res)=> {
    let link = req.body.link
    let redirect = req.body.redirect

    let ocupados = ['api', 'action', 'link']
    if(link) {
        link = link.trim().split(' ').join('').normalize('NFD').replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, '');
    } else if(!link) {
        function gerarL () {
            var result = ''
            var possibilidades = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            var length = possibilidades.length
            for (var i = 0; i < 6; i++){
                result += possibilidades.charAt(Math.floor(Math.random() * length))
            }
            return result
        }
        link = gerarL()
    } else if(!redirect) {
        return res.render('index.ejs', { msg : 'Preencha os campos necessários!', checklink: null})
    }
    
    
    if(ocupados.includes(link)) return res.render('index.ejs', { msg: `Esse nome do link já foi usado!` , checklink: null})
    let find = await Tabela.findOne({where: {link: link}})
    if(find) return res.render('index.ejs', { msg: `Esse nome do link já foi usado!` , checklink: null})
    await Tabela.create({link: link, redirect: redirect, clicks: 0}).catch(err => { throw err;})
    res.render('index.ejs', { msg: `${baseURL}/${link}`, checklink: `${baseURL}/link/${link}`})
})

https.createServer({
    key: fs.readFileSync('privkey.pem'),
    cert: fs.readFileSync('fullchain.pem')
}, app).listen(80,()=> {
    console.log('Site online na porta 8880')
})

app.listen(8880,()=> {
    console.log('Site online na porta 8880')
})