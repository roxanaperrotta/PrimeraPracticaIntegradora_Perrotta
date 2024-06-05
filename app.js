import express from "express";
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import viewsRouter from './src/routes/views.routes.js';
import productsRouter from './src/routes/products.routes.js';
import {ProductManager} from "./src/managers/ProductManager.js";
import initSocket from "./src/sockets.js";
import chatRouter from "./src/routes/chat.routes.js";
import cartsRouter from "./src/routes/carts.routes.js";
import {chatModel} from "./src/dao/models/chat.model.js";
import config from './src/config.js';
import cors from 'cors';


const app=express();
const productManager =  new ProductManager ();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(`${config.DIRNAME}/public`));

app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');


app.use ('/', viewsRouter);
app.use ('/realtimeproducts', viewsRouter)

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/chat", chatRouter)


const expressInstance = app.listen(config.PORT, async() => {
    await mongoose.connect(config.MONGODB_URI).then(() => {
        console.log('Conexión exitosa a la base de datos')
    })
    .catch((error) => {
        console.error('Error conectándose a la base de datos:', error)
    });
})

    
    const socketServer = initSocket(expressInstance);
    app.set('socketServer', socketServer);

   socketServer.on('connection', (socket) => {
        console.log('Usuario conectado');
    
        socket.on('message', async (data) => {
            try {
                await chatModel.create({ email: data.email, message: data.message })
                const messages = await chatModel.find()
                socketServer.emit('messageLogs', messages)
            } catch (error) {
                console.error('Error de escritura en la base de datos')
            }
        });
    
        socket.on('updateMessages', async () => {
          
            const messages = await chatModel.find()
            socketServer.emit('messageLogs', messages)
            socket.broadcast.emit('newUserConnected')
        });
    

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
        } );
    
    });



