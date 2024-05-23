import express from "express";
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import viewsRouter from './routes/views.routes.js';
import productsRouter from './routes/products.routes.js';
import initSocket from "./sockets.js";
import chatRouter from "./routes/chat.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import {chatModel} from "./dao/models/chat.model.js";
import config from './config.js';

const app=express();

const expressInstance = app.listen(config.PORT, async() => {
    await mongoose.connect(config.MONGODB_URI);

    const socketServer = initSocket(expressInstance);
    app.set('socketServer', socketServer);

    socketServer.on('connection', (socket) => {
        console.log('Usuario conectado')
    
        socket.on('message', async (data) => {
            try {
                await chatModel.create({ email: data.email, message: data.message })
                const messages = await chatModel.find()
                socketServer.emit('messageLogs', messages)
            } catch (error) {
                console.error('Error de escritura en la base de datos')
            }
        })
    
        socket.on('updateMessages', async () => {
          
            const messages = await chatModel.find()
            socketServer.emit('messageLogs', messages)
            socket.broadcast.emit('newUserConnected')
        })
    
    
    socketServer.on("connection" , (socket) =>{
        console.log ("Nueva conexión");
        socket.on("mensaje", data =>{
          console.log("mensaje", data)});
    
    
        try {
            const products = productManager.getProducts();
            socketServer.emit("products", products);
    
        } catch (error) {
            socketServer.emit('response', { status: 'error', message: error.message });
        }
       
    })
         socket.on("new-Product",   (newProduct) => {
            
            try {
    
               // Validate price
    if (typeof newProduct.price !== 'number') {
        console.error('Price must be a number');
        // Handle the error accordingly
    }
    
    // Validate stock
    if (typeof newProduct.stock !== 'number') {
        console.error('Stock must be a number');
        // Handle the error accordingly
    }
                    
                
                const productoNuevo = {
                      
                        title: newProduct.title,
                        description: newProduct.description,
                        code: newProduct.code,
                        price: newProduct.price,
                        stock: newProduct.stock,
                        thumbnail: newProduct.thumbnail,
        
                }
                
    
                const pushProduct =   productManager.addProduct(productoNuevo);
                const listaActualizada =   productManager.getProducts();
                socketServer.emit("products", listaActualizada);
                socketServer.emit("response", { status: 'success' , message: pushProduct});
    
            } catch (error) {
                socketServer.emit('response', { status: 'error', message: error.message });
            }
        })
      
    
    
        socket.on("delete-product", (id) => {
            try {
                const pid = parseInt(id)
                const deleteProduct =  productManager.deleteProduct(pid)
                const listaActualizada =  productManager.getProducts()
                socketServer.emit("products", listaActualizada)
                socketServer.emit('response', { status: 'success' , message: "producto eliminado correctamente"});
            } catch (error) {
                socketServer.emit('response', { status: 'error', message: error.message });
            }
        } )
    
    })

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

app.use ('/', viewsRouter);
app.use ('/realtimeproducts', viewsRouter)

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/chat", chatRouter)
app.use('/static', express.static(`${config.DIRNAME}/public`));

});