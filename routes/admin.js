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
router.get('/',verifyLogin,async function(req, res, next) {
  let admin=req.session.admin

  console.log(admin)
  users=await userHelper.getallusers()
  productHelper.getallproducts().then((products)=>{
    res.render('admin/admin-index',{products,admin,adminn:true,users});
  })

});

router.get('/viewproducts',verifyLogin,(req,res)=>{
  let admin=req.session.admin
  productHelper.getallproducts().then((products)=>{
    res.render('admin/view-product',{products,admin,adminn:true,users});
  })
})

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
  res.render("admin/login",{"loginErr":req.session.adminloginErr,adminn:true})
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
router.get('/edit-product',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let proId=req.query.id
  let product=await productHelper.getProductDetails(proId)
  
  res.render("admin/edit-product",{user,adminn:true,product})
  
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
        
          console.log(err)
        }
        
      })
    
      image=req.files.Image[1]
      image.mv('./public/product-images/'+proId+'2'+'.jpg',(err,done)=>{
        if(err){
        
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

router.get('/all-orders',verifyLogin, async (req,res)=>{
  console.log('call vann all orders')
  let products=await userHelper.getAllOrder()
  console.log('products')
  res.render('admin/all-orders',{products,adminn:true})
})

router.get('/coupons',verifyLogin,(req,res)=>{
  userHelper.getCoupons().then((coupons)=>{
    res.render('admin/coupons',{coupons,adminn:true})

  })
  
})
router.get('/new-coupon',verifyLogin,(req,res)=>{
  res.render('admin/new-coupon',{adminn:true})
})

router.post('/new-coupon',(req,res)=>{
   userHelper.AddNewCoupon(req.body).then(()=>{
     res.render('admin/new-coupon')
   })
})

router.get('/edit-coupon',verifyLogin,async(req,res)=>{
couponId=req.query.id
let coupon=await userHelper.getCouponDetails(couponId)
  res.render('admin/edit-coupon',{coupon,adminn:true})
})

router.post('/edit-coupon',(req,res)=>{
  id=req.query.id
  userHelper.editCoupon(id,req.body).then(()=>{
    res.redirect('/admin/coupons')
  })
})
  
  router.get('/delete-coupon',verifyLogin,(req,res)=>{
    let couponId=req.query.id
    userHelper.deleteCoupon(couponId).then((response)=>{
      res.redirect('/admin/coupons')
  })

})


router.get('/change-user-status',verifyLogin,(req,res)=>{
  console.log(req.query.id)
  console.log(req.query.status);
  if(req.query.status==='active'){
    userHelper.blockUser(req.query.id).then(()=>{
      console.log('Blocked')
      res.redirect('/admin')
    })
  }
  else{
    userHelper.unblockUser(req.query.id).then(()=>{
      console.log('unBlocked')
      res.redirect('/admin')
    })
  }
})


module.exports = router;
