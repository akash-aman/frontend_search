// -------------------------------------------------------------------------------
// I got inspired 🤓 from MDN docs search implementation, its literally unique ❤️,
// As it is implemented locally on client side. No elastic search nothing.
// Not even algolia. 😂
// -------------------------------------------------------------------------------

// -------------------------------------------------------------------------------
//  
//
// ------------------------------------------------------------------------------- 



import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Fzf } from 'fzf'
import axios from "axios";
//import data from "../search.json"

const initialState = {
    rawData: null,
    searchField: "", //"title" | "url"
    result: null,
    status: 'idle', //'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
}

var indexedData = null
//------------------------------------------------------------------------------
export const fetchRawData = createAsyncThunk('search/fetchRawData', async (_, thunkAPI) => {

    // ----------------------------
    // fetch your data here
    // ----------------------------
    const data = await axios.get("https://raw.githubusercontent.com/akash-aman/json/main/search.json");

    const formattedData = await data.data.map(({ title, url }) => ({
        title,
        url: url
            .split('/')
            .slice(1)
            .filter((i) => i !== 'docs')
            .join(' / ')
    }))

    thunkAPI.dispatch(setRawData(formattedData))
    thunkAPI.dispatch(indexingRawData("title"))
})


export const indexingRawData = createAsyncThunk('search/indexingRawData', async (value, thunkAPI) => {
    // ----------------------------------------------------------
    // setting field to be searched
    // this function need to be called to change searchField
    //-----------------------------------------------------------
    thunkAPI.dispatch(setSearchType(value))

    const indexing = new Fzf(thunkAPI.getState().search.rawData, {
        limit: 75,
        selector: (item) => {
            // ------------------------------------------
            // setting instance of search at global scope
            // ------------------------------------------
            if (thunkAPI.getState().search.searchField === "title") {
                return item.title
            } else if (thunkAPI.getState().search.searchField === "url") {
                return item.url
            }
        }
    })

    indexedData = indexing
})

//------------------------------------------------------------------------------
// async Search function from redux store
//------------------------------------------------------------------------------
export const setSearchResults = createAsyncThunk('search/getSearchResults', async (value, thunkAPI) => {

    if (thunkAPI.getState().search.status == "succeeded") {
        if (value === '') {
            return null
        }
        return await JSON.parse(JSON.stringify(indexedData.find(value)))
    }

})



const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setRawData: (state, action) => {
            state.rawData = action.payload
        },
        setSearchType: (state, action) => {
            state.searchField = action.payload
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchRawData.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(fetchRawData.fulfilled, (state, action) => {
                state.status = "succeeded"
            })
            .addCase(fetchRawData.rejected, (state, action) => {
                state.status = "failed"
            })
            .addCase(setSearchResults.fulfilled, (state, action) => {
                state.result = action.payload
            })
            .addCase(indexingRawData.fulfilled, (state, action) => {
                //----------------------------------------
                // check log for indexing Completed or not
                //----------------------------------------
                console.log("Indexing Completed")
            })
            .addCase(indexingRawData.rejected, (state, action) => {
                //----------------------------------------
                // check log for indexing Completed or not
                //----------------------------------------
                console.log("Indexing failed")
            })
    }
})



export const getSearchResult = (state) => state.search.result;
export const { setRawData, setSearchType } = searchSlice.actions

export default searchSlice.reducer 