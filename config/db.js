if(process.env.NODE_ENV == 'prodution') {
    module.exports = {mongoURI: "mongodb+srv://samuelAdm:@Merceedes2@blogapp-prod-d5tga.gcp.mongodb.net/test?retryWrites=true&w=majority"}
}
else {
    module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}