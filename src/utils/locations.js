const generateLocationMessage=(username,url)=>{
    return {
        username: username,
        url: url,
        createdAt: new Date().getTime()
    }
}
module.exports={
    generateLocationMessage
}