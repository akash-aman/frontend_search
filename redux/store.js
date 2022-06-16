import { configureStore } from "@reduxjs/toolkit"
import SearchReducer from "./../state/searchSlice"
export const store = configureStore({

    reducer: {
        search: SearchReducer
    }
})