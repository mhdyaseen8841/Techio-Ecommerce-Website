
    function addToCart(proId){
        
        $.ajax({
            url:'/addtocart/'+proId,
            method:'get',
            success:(response)=>{
                if(response.status){
                    let count=$('#cart-count').html()
                    count=parseInt(count)+1
                    $("#cart-count").html(count)
                }
            }
        })
    }
  

    
function addToWishlist(proId){
    $.ajax({
        url:'/addtowishlist/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#wish-count').html()
                count=parseInt(count)+1
                $("#wish-count").html(count)
            }
        }
    })
}
   

