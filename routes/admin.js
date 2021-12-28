const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helpers')

const verifyLogin=(req,res,next)=>{
  if(req.session.adminloggedIn){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  let admin=req.session.admin

  console.log(admin)
  productHelper.getallproducts().then((products)=>{
    res.render('admin/view-product',{products,admin,adminn:true});
  })

});

router.get('/add-product', verifyLogin,(req,res,next)=>{
  let admin=req.session.admin
  res.render('admin/add-product',{admin,adminn:true});
  
})
router.post('/add-product',(req,res,next)=>{
  console.log("hloooooooooooooooooooooo");
console.log(req.body)
productHelper.addProduct(req.body,(id)=>{
  let image=req.files.Image[0]
  image.mv('./public/product-images/'+id+'1'+'.jpg',(err,done)=>{
    if(err){
      console.log(err)
    }
    
  })

  image=req.files.Image[1]
  image.mv('./public/product-images/'+id+'2'+'.jpg',(err,done)=>{
    if(err){
     
      console.log(err)
    }
    
  })

  image=req.files.Image[2]
  image.mv('./public/product-images/'+id+'3'+'.jpg',(err,done)=>{
    if(!err){
      res.render('admin/add-product')
    }else{
      console.log(err)
    }
    
  })

})
})



router.get('/login',(req,res)=>{
  if(req.session.admin){
    res.redirect("/admin")
  }else{
  res.render("admin/login",{"loginErr":req.session.adminloginErr})
  req.session.adminloginErr=false
  
  }
})


router.post('/login',(req,res)=>{
  userHelper.doAdminLogin(req.body).then((response)=>{
    if(response.status){
      req.session.admin=response.admin
      req.session.adminloggedIn=true
      res.redirect('/admin')
    }
    else{
      req.session.adminloginErr="invalid username or password"
      res.redirect('/admin/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.admin=null
  req.session.adminloggedIn=false
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
  
  res.render("admin/edit-product",{user,admin:true,product})
  
})


router.post('/edit-product',(req,res)=>{
  let proId=req.query.id
  console.log("proID below")
  console.log(proId)
  productHelper.updateProduct(req.body,proId).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let image=req.files.Image[0]
      image.mv('./public/product-images/'+proId+'1'+'.jpg',(err,done)=>{
        if(err){
          console.log('11111111111111111111111111111111111111111');
          console.log(err)
        }
        
      })
    
      image=req.files.Image[1]
      image.mv('./public/product-images/'+proId+'2'+'.jpg',(err,done)=>{
        if(err){
         console.log('22222222222222222222222222222222222222222222');
          console.log(err)
        }
        
      })
    
      image=req.files.Image[2]
      image.mv('./public/product-images/'+proId+'3'+'.jpg',(err,done)=>{
        if(!err){
          res.render('admin/add-product')
        }else{
          console.log(err)
        }
        
      })
    }
  })
})

router.get('/all-orders', async (req,res)=>{
  console.log('call vann all orders')
  let products=await userHelper.getAllOrder()
  console.log('products')
  res.render('admin/all-orders',{products})
})

module.exports = router;
