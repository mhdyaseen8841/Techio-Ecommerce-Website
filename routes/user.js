
const { response } = require('express');
var express = require('express');
const session = require('express-session');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.userloggedIn){
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
  let lap= await productHelper.getProductLaptop()
  let phone= await productHelper.getProductSmartphone()
  let accessories= await productHelper.getProductAccessories()
  console.log('oooooooooi');
  console.log(lap)
  console.log('hiiiiiiiiiiiiiiii');
  console.log(phone);
  productHelper.getallproducts().then((products)=>{
    
    res.render('user/index',{user,products,cartCount,lap,phone,accessories});
  })
 
});
router.get('/signup',(req,res)=>{
  if(req.session.userloggedIn){
    res.redirect("/")
  }else{
  res.render("user/signup")
  }
})
router.get('/login',(req,res)=>{
  console.log('call vannu');
  if(req.session.userloggedIn){
    console.log('check chythu');
    res.redirect("/")
  }else{
    console.log('Error vannu user illa');
  res.render("user/login",{"loginErr":req.session.userloginErr})
  req.session.userloginErr=false
  
  }
})
router.post('/signup',(req,res)=>{
  console.log("reqbody ithaanu");
  console.log(req.body);
  userHelper.doSignup(req.body).then((response)=>{
     
    req.session.user=response.user
    req.session.userloggedIn=true
       let user=req.session.user
      let username=response.user.Name
      let useremail=response.user.Email
    res.render('user/profile-form',{username,user,useremail})
  })
})

router.post('/updateProfile',(req,res)=>{
  console.log('update ilekk call vannnnnnnnn');
  console.log(req.body)
  console.log(req.query.id)
  userHelper.profileUpdate(req.body,req.query.id).then(()=>{
    console.log('lets ready for image')
    let image=req.files.Image
  image.mv('./public/user-image/'+req.query.id+'.jpg',(err,done)=>{
    if(!err){
      console.log('no error')
     res.redirect('/')
    }else{
      console.log(err)
    }
  })
  })
})


router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user
      req.session.userloggedIn=true
      res.redirect('/')
    }
    else{
      req.session.userloginErr="invalid username or password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userloggedIn=false
  res.redirect('/')
})

router.get('/addtocart/:id',verifyLogin,(req,res)=>{ 
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
  res.json({status:true})
  })
})

router.get('/cart',verifyLogin,async (req,res)=>{
let products=await userHelper.getCartProducts(req.session.user._id)
let total=0
if(products.length>0){
   total=await userHelper.getTotalAmount(req.session.user._id)
}

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
  let userDetails=await userHelper.getUserDetails(req.session.user._id)
  let total=await userHelper.getTotalAmount(req.session.user._id)
 console.log('user details dheee');
  console.log(userDetails)
  res.render('user/order-page',{total,user: req.session.user,userDetails})
})

router.post('/place-order',verifyLogin,async(req,res)=>{
  let products=await userHelper.getCartProductList(req.session.user._id)
    let price=await userHelper.getTotalAmount(req.session.user._id)
  userHelper.PlaceOrder(req.body,products,price).then((orderId)=>{
    if(req.body['payment-method']=='COD'){
      res.json({cod_success:true})
    }else{
      userHelper.generateRazorPay(orderId,price).then((response)=>{
       res.json(response)
      })
    }

    
  })

})

router.get('/ordered-response',(req,res)=>{
  res.render('user/ordered-response',{user:req.body.userId})
})

router.get('/orders', async (req,res)=>{
  let products=await userHelper.getOrderList(req.session.user._id)
  
  res.render('user/order-list',{products,user:req.session.user})
})

router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelper.getOrderProducts(req.params.id)
  
  
  console.log(products)
  res.render('user/view-order-products',{user:req.session.user,products})
})

router.post('/verify-payment',(req,res)=>{
  console.log(req.body)
  userHelper.verifyPayment(req.body).then(()=>{
   userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
     res.json({status:true})
   })
  }).catch((err)=>{
    res.json({status:false})
  })
})


router.get('/productview',async (req,res)=>{
  

  res.render('user/product-details')
  
})

router.get('/user-profile',async (req,res)=>{
  console.log('userreeeeeee');
 let userDetails=await userHelper.getUserDetails(req.session.user._id)
 console.log('dheeeee user')
console.log(userDetails)
  res.render('user/profile',{userDetails})
})


module.exports = router;
