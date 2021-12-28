var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectID
const Razorpay= require('razorpay')
const e = require('express')
const { response } = require('express')
var instance = new Razorpay({
    key_id: 'rzp_test_Uakhyu7rd2ie3B',
    key_secret: '3p8ZHSdwg5qBiUEiZHJVIKXz',
  });
module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            userData.Password=await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async (res)=>{
              let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:res.insertedId})
                console.log("ithaan response")
                console.log(response);
                response.user=user
                response.status=true
                resolve(response);
            })
            

        })
       
    },
    profileUpdate:(profileData,userId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.USER_COLLECTION).updateOne(
                    {_id:objectId(userId)},
                    {$set: {Mobile: profileData.Mobile,Address:profileData.Address,Pincode:profileData.Pincode,Country:profileData.Country,State:profileData.State}}, {multi: true}).then(()=>{
                         resolve()
                     })
            })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log("login success")
                        response.user=user
                        response.status=true
                        resolve(response)
                    }
                    else{
                        console.log("login failed");
                        resolve({status:false})
                    }
                })
            }else{
                console.log("login failed")
                resolve({status:false})
            }
        })
    },
    doAdminLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:userData.Email})
            if(admin){
                bcrypt.compare(userData.Password,admin.Password).then((status)=>{
                    if(status){
                        console.log("login success")
                        response.admin=admin
                        response.status=true
                        resolve(response)
                    }
                    else{
                        console.log("login failed");
                        resolve({status:false})
                    }
                })
            }else{
                console.log("login failed")
                resolve({status:false})
            }
        })
    },
    addToCart:(proId,userId)=>{
        let proObj={
            item:objectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(userCart){
                
                    let proExist=userCart.product.findIndex(product=> product.item==proId)
                    console.log('prooooooooooooo exist')
                    console.log(proExist);
                    if(proExist!=-1){
                        db.get().collection(collection.CART_COLLECTION)
                        .updateOne({user:objectId(userId),'product.item':objectId(proId)},
                        {
                            $inc:{'product.$.quantity':1}
                        }
                        ).then(()=>{
                            resolve()
                            
                        })
                    }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                {
                   
                        $push:{product:proObj}
                    
                }).then((response)=>{
                    resolve()
                })
            }
            }  
            else{
                cartObj={
                    user:objectId(userId),
                    product:[proObj]
                }

                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((result)=>{
                    resolve()
                })
            }
        })
    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$product'
                },{
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                       item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }

            ]).toArray()
            console.log(cartItems)
            resolve(cartItems)
            
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count=cart.product.length
            }
            resolve(count)
        })
    },
    changeProductQuantity:(details)=>{
        count=parseInt(details.count)
        quantity=parseInt(details.quantity)
        return new Promise((resolve,reject)=>{
            if(count==-1 && quantity==1){
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                {
                    $pull:{product:{item:objectId(details.product)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
            }else{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart),'product.item':objectId(details.product)},
                {
                    $inc:{'product.$.quantity':count}
                }
                ).then((response)=>{
                   
                    resolve({status:true})
                    
                })
            }
           
        })
    },
    removeCartProducts:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart)},
            {
                $pull:{product:{item:objectId(details.product)}}
            }).then((response)=>{
                resolve({removeProduct:true})
            })
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            
          let  total=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$product'
                },{
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                       item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    
                    $group:{
                        _id:null,
                        
                        total:{$sum:{$multiply: ['$quantity', {$toInt: '$product.Price'}]}}
                    }
                }

            ]).toArray()
          
            resolve(total[0].total)
           
        })
    },
    PlaceOrder:(order,product,total)=>{
        return new Promise((resolve,reject)=>{
            console.log('hloooooooooooo')
            let status=order['payment-method']==='COD'?'placed':'pending'
            
            let orderObj={
                deliveryDetails:{
                    mobile:order.Mobile,
                    address:order.Address,
                    pincode:order.Pincode
                },
                userId:objectId(order.userId),
                paymentMethod:order['payment-method'],
                product:product,
                totalAmount:total,
                date:new Date(),
                status:status
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
               db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
               console.log(response);
                resolve(response.insertedId)
            })
        })
    },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            
            let cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
           
            resolve(cart.product)
        })
    },
getOrderList:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
        console.log('orders list')
        console.log(orders);
        resolve(orders)
    })
},
getAllOrder:()=>{
   let userId='61a8b40e5ee4f2c937408f1d';
    return new Promise(async(resolve,reject)=>{
        let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
        console.log('orders list')
        console.log(orders);
        resolve(orders)
    })
},
getOrderProducts:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{_id:objectId(orderId)}
            },
            {
                $unwind:'$product',
                
            },{
                $project:{
                    item:'$product.item',
                    quantity:'$product.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                   item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
            }

        ]).toArray()
        console.log(orderItems)
        resolve(orderItems)
        
    })
},
generateRazorPay:(orderId,price)=>{
    return new Promise((resolve,reject)=>{
        
        instance.orders.create({  amount: price*100, 
             currency: "INR",
             receipt: ""+orderId,  
             notes: {    key1: "value3",    key2: "value2"  }},(err,order)=>{
                 if(err){
                     console.log(err);
                 }else{
                console.log("new Order:",order)
                resolve(order)
                 }
             })
    })
},
verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', '3p8ZHSdwg5qBiUEiZHJVIKXz');
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
        hmac=hmac.digest('hex')
        if(hmac==details['payment[razorpay_signature]']){
            resolve()
        }else{
            reject()
        }
    })
},
changePaymentStatus:(orderId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
        {
            $set:{
                status:'placed'
            }
        }).then(()=>{
            resolve()
        })
    })
},
getUserDetails:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        
        console.log('this is user id');
        console.log(userId);
      let user= await  db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
      
        if(user){
            console.log('user found');
            console.log(user)
            resolve(user)
         }
          else{
              console.log("user not found");
          }
        })
    },
    editUser:(userId,userDetails)=>{
        return new Promise((resolve,reject)=>{
          console.log('hloooooooooooooooooooo')
          console.log(userDetails);
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{
                
                Name:userDetails.Name,
                Email:userDetails.Email,
                Password:userDetails.Password,
                Address:userDetails.Address,
                Country:userDetails.Country,
                Mobile:userDetails.Mobile,
                Pincode:userDetails.Pincode,
                State:userDetails.State
            }
        }).then((response)=>{
           
            resolve(response)
        })
        })
    },
    getUserWithEmail:(userDetails)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userDetails.EmailConfirm})
        
            if(user){
                console.log('user indttaa')
                response.Name=user.Name
                response.Id=user._id
                response.Email=user.Email
                response.status=true
                        resolve(response)
            }else{
                console.log("login failed")
                response.status=false
                resolve(response)
            }
        
        }
        ) },
        changePassword:(userId,NwPassword)=>{
            return new Promise(async(resolve,reject)=>{
                NwPassword=await bcrypt.hash(NwPassword,10)
                console.log('new password')
                console.log(NwPassword);
               db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{
                Password:NwPassword
            }
        }).then((response)=>{
            console.log(response)
            resolve()
        })
        })
    
    }












    }
    

