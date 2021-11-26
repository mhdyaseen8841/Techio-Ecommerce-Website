
const { response } = require('express');
var express = require('express');
const session = require('express-session');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page.*/
router.get('/', async function(req, res, next) {
  let user=req.session.user
  console.log(user)
  let cartCount=null;
  if(user){
    cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  
  productHelper.getallproducts().then((products)=>{
    
    res.render('user/index',{user,products,admin:false,cartCount});
  })
 
});
router.get('/signup',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect("/")
  }else{
  res.render("user/signup")
  }
})
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect("/")
  }else{
  res.render("user/login",{"loginErr":req.session.loginErr})
  req.session.loginErr=false
  }
})
router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((response)=>{
    console.log(response)
    res.redirect('/')
  })
})
router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }
    else{
      req.session.loginErr=true
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/addtocart/:id',verifyLogin,(req,res)=>{ 
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
  res.json({status:true})
  })
})

router.get('/cart',verifyLogin,async (req,res)=>{
let products=await userHelper.getCartProducts(req.session.user._id)
let total=await userHelper.getTotalAmount(req.session.user._id)
console.log(products)
res.render('user/cart',{products,user:req.session.user._id,total})
  
})

router.post('/change-product-quantity',(req,res,next)=>{
  
  userHelper.changeProductQuantity(req.body).then(async(response)=>{
    
    response.total=await userHelper.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.post('/remove-cart-products',(req,res,next)=>{
  
  console.log(req.body);
  userHelper.removeCartProducts(req.body).then((response)=>{
    res.json(response)
  })
})
router.get('/place-order',verifyLogin,async(req,res)=>{
  
  let total=await userHelper.getTotalAmount(req.session.user._id)
  console.log(total)
  res.render('user/order-page',{total})
})

module.exports = router;
