const express = require('express');
const exphbs  = require('express-handlebars');
const pg = require('pg');

const Pool = pg.Pool;
const AvoShopper = require('./avo-shopper')

let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/avo_shopper';

const pool = new Pool({
	connectionString,
	ssl: {
	  rejectUnauthorized: false,
	},
  });

let avoShopper = AvoShopper(pool);

const app = express();
const PORT =  process.env.PORT || 3019;

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const { request } = require('express');
const flash = require('express-flash');
const session = require('express-session');

app.use(session({
    secret: 'this is my long String that is used for session in http',
    resave: false,
    saveUninitialized: true
}));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support
app.use(flash());
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

let counter = 0;


app.get('/', async function(req, res) {
	let deals =  await avoShopper.topFiveDeals();
	console.log(deals);
	res.render('index', {
		deals 
	});
});

app.get('/shops', async (req, res)=>{
	let shops =  await avoShopper.listShops();
	res.render('shops',{
		shops
	})
})

app.get('/add-shop', async (req,res)=>{

	res.render('addShop')
})

app.get('/add-shop-deals', async (req, res)=>{
	let shops =  await avoShopper.listShops();
	res.render('addShopDeal',{
		shops
	})
})

app.get('')

app.post('/add-shop', async (req, res)=>{
	let shopName = req.body.name

	await avoShopper.createShop(shopName);
	res.redirect('/');
})

app.get('/shop-deals', async (req,res)=>{
	let shops =  await avoShopper.listShops();
	res.render('showShopDeals',{
		shops
	})
})

app.post('/add-shop-deals', async (req,res)=>{
	let shopId = req.body.name;
	let qty = req.body.qty;
	let price = req.body.price;
	if(qty > 0 && price > 0.00){
		await avoShopper.createDeal(shopId,qty,price);
	}
	else{
		req.flash('error', "Please enter quantity and/or price");
	}	
	res.render('addShopDeal')
})

app.post('/shop-deals', async (req, res)=> {

	let shop = req.body.name;
	console.log(shop);
	let shops =  await avoShopper.listShops();
	let deals = await avoShopper.dealsForShop(shop);
	console.log(deals);
	res.render('showShopDeals',{
		deals,shops
	})
})

// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`AvoApp started on port ${PORT}`)
});