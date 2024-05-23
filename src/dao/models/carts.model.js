import mongoose from "mongoose";
import {Schema} from "mongoose";

const cartsCollection = 'carts'

const cartSchema = new mongoose.Schema({
    products: {
        type: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'products',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        default: function () {
            return []
        }
    }
})


export const cartModel = mongoose.model(cartsCollection, cartSchema)