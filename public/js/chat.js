const socket=io()

//elements

const $messageForm = document.querySelector("#message-form")
const $messageFormInput = document.querySelector("#message-input")
const $messageFormButton = document.querySelector("#message-button")
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

//templates

const messageTemplate  = document.querySelector('#message-template').innerHTML
const locationMessageTemplate  = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate  = document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room}= Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll = ()=>{
     //new message element

     const $newMessage =  $messages.lastElementChild
      
     //hight of  the new message
     const newMessageStyles = getComputedStyle($newMessage)
     const newMessageMargin = parseInt( newMessageStyles.marginBottom)
     const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

     //visible height
     const visibleHeight = $messages.offsetHeight

     //height of msg container
     const containerHeight = $messages.scrollHeight

     //how far we have scroll?
     const scrollOffset = $messages.scrollTop + visibleHeight

     if(containerHeight - newMessageHeight <= scrollOffset ){
         $messages.scrollTop = containerHeight 
     }

}

socket.on("message",({username,text,createdAt})=>{
    const html = Mustache.render(messageTemplate,{
        username :username,
        message : text,
        createdAt : moment(createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on("locationMessage",({username,url,createdAt})=>{
    console.log(url)
    const html = Mustache.render(locationMessageTemplate,{
        username:username,
        url,
        createdAt : moment(createdAt).format('h:mm a')
    })

     $messages.insertAdjacentHTML('beforeend',html)
     autoscroll()
})

socket.on("roomData",({room,users})=>{
    const html= Mustache.render(sidebarTemplate,{
        room,
        users
    })

    document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener('submit',(event)=>{
    event.preventDefault();

    //disable the form 
    $messageFormButton.setAttribute('disabled','disabled')

    socket.emit('sendMessage',event.target.elements.message.value,(error)=>{

        //enabled the form
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.value= ''
            $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log("Message Delivered")
    })
})


$sendLocationButton.addEventListener('click',(event)=>{

    if(!navigator.geolocation){
        return alert("Geo Location service is not supported by your browser.")
    }

    //disabled

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
    socket.emit('sendLocation',{
        "latitude":position.coords.latitude,
        "longitude":position.coords.longitude
      },(error)=>{
       
        //enabled 
        $sendLocationButton.removeAttribute('disabled')


        if(error){
            return console.log(error)
        }
        console.log("Location Shared")
      } )
    })
})

socket.emit('join',{
    username,
    room
},(error)=>{

    if(error) {
        alert(error)
        location.href= '/'
    }

    console.log("User Joined")

})



