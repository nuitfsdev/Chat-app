const socket=io() 

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

const  messageTemplate=document.querySelector('#message-template').innerHTML
const  locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (Math.round(containerHeight - newMessageHeight - 1) <= Math.round(scrollOffset)) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(location)=>{
    console.log(location)
    const html=Mustache.render(locationTemplate,{
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //const message=document.querySelector('input').value
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message=e.target.elements.message.value
    //console.log(message)
    socket.emit('sendMessage',message,(anouncement)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        console.log(anouncement)
    })
})

$sendLocationButton.addEventListener('click',(e)=>{
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disable','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitute: position.coords.latitude,
            longitute: position.coords.longitude
        },(message)=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log(message)
        })
    })
})

socket.emit('join', {username,room},(error)=>{
    if( error)
    {
        alert(error)
        location.href="/"
    }
})