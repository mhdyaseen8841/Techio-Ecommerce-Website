const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helpers')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  let user=req.session.user
  console.log(user)
  productHelper.getallproducts().then((products)=>{
    res.render('admin/view-product',{products,user,admin:true});
  })

});

router.get('/add-product', verifyLogin,(req,res,next)=>{
  res.render('admin/add-product',{admin:true});
  
})
router.post('/add-product',(req,res,next)=>{

productHelper.addProduct(req.body,(id)=>{
  console.log(id)
  let image=req.files.Image
  image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
    if(!err){
      res.render('admin/add-product')
    }else{
      console.log(err)
    }
  })

})
})

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect("/admin")
  }
  else{

  res.render("admin/login",{"loginErr":req.session.loginErr})
  req.session.loginErr=false
  }
})
router.get('/signup',(req,res)=>{
  res.render("admin/signup")
})
router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((response)=>{
    console.log(response)
    req.session.loggedIn=true
      req.session.user=response.user
    res.redirect('/admin')
  })
})

router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response
      res.redirect('/admin')
    }else{
      req.session.loginErr=true
      res.redirect('/admin/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/admin')
})

router.get('/delete-product', verifyLogin,(req,res)=>{
   let proId=req.query.id
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin')
  })

})
router.get('/edit-product',async(req,res)=>{
  let user=req.session.user
  let proId=req.query.id
  let product=await productHelper.getProductDetails(proId)
  console.log(product)
  res.render("admin/edit-product",{user,admin:true,product})
  
})

router.post('/edit-product',(req,res)=>{
  let proId=req.query.id
  console.log("proID below")
  console.log(proId)
  productHelper.updateProduct(req.body,proId).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+proId+'.jpg')
    }
  })
})

module.exports = router;
