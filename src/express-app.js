const express = require('express')
const cors = require('cors')
const {HandleError} = require('./utils/error-handler')

module.exports = async(app) => {

    //Parses incoming requests with JSON payloads with size of 1 mb max.
    app.use(express.json({limit : '1mb'}))

    //Parses incoming requests with x-www-form-urlencoded payloads (like HTML form submissions) 
    //extended: true allows nested objects in the query string 
    app.use(express.urlencoded({extended : true , limit : '1mb'}))

    //allows your server to respond to requests from different origins
    app.use(cors())

    //Serves static files from the public directory ,accessing ex - http://localhost:8000/logo.png will return that image.
    app.use(express.static(__dirname + '/public'))

    app.use(HandleError)



}