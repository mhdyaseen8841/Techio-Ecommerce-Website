var db=require('../config/connection')
var collection=require('../config/collection')
var objectId=require('mongodb').ObjectID
module.exports={
    addProduct:(product,callback)=>{
        db.get().collection('product').insertOne(product).then((data)=>{
         
            callback(data.insertedId)
        })
    },
    getallproducts:()=>{
        return new Promise(async (resolve,reject)=>{

            
            let product= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            
           
            resolve(product)
        })
    },
    getProductLaptop:()=>{
        return new Promise(async (resolve,reject)=>{
            let prod="gaming laptop"
              
            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:prod}).toArray()
            
            resolve(products)

        })
    },
    getProductSmartphone:()=>{
        return new Promise(async (resolve,reject)=>{
            let prod="smart phone"
              
            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:prod}).toArray()
            
            resolve(products)

        })
    },
    getProductAccessories:()=>{
        return new Promise(async (resolve,reject)=>{
            let prod="accessories"
            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:prod}).toArray()
            resolve(products)

        })
    },

    


    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
              console.log('hloooooooooooooo');
                console.log(product);
                resolve(product)
            })
        })
    },
    updateProduct:(proDetails,proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{$set:{
                Name:proDetails.Name,
                Category:proDetails.Category,
                Price:proDetails.Price,
                Seller:proDetails.Seller,
                Description:proDetails.Description,
                Delivery:proDetails.Delivery
            }
        }).then((response)=>{
            resolve()
        })
        })
    }
}