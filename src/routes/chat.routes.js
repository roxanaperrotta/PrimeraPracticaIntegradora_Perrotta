import { Router } from "express";
import { chatModel } from "../dao/models/chat.model.js";


const chatRouter = Router()

chatRouter.get('/', (req, res) => {
    res.render('chat', {})
})

export default chatRouter