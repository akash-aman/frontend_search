# **Frontend Search Implementation**

- This app fetch json data only one time on page load and make search index for your data.

## **Code for Search Logic**

- Implemented 3 async function :
    - `fetchRawData`  : For fetching json data single time after page load.
        - can be called on page load, I have dispatched this action on hovering search bar.
        - by compressing from brotli we can further reduce network payload size.
    - `indexingRawData` : Create Indexing and keeping reference of `IndexedData` .
        - We should not create reference multiple time. As we need indexing of data only one time and utilising that for every query.
    - `setSearchResults` : Dispatching input search query and setting result in state. Further using that state to show result.
- Setup your redux store and you are ready to go 😊. Use, Modify, & be creative ✌️.

```jsx

    // -------------------------------------------------------------------------------
    // I got inspired 🤓 from MDN docs search implementation, its literally unique ❤️,
    // As it is implemented locally on client side. No elastic search nothing.
    // Not even algolia. 😂
    // -------------------------------------------------------------------------------

    import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
    import { Fzf } from 'fzf'
    import axios from "axios";
    //import data from "../search.json"

    const initialState = {
        rawData: null,
        searchField: "", //"title" | "url"
        searchQuery: "",
        searchResult: null,
        status: 'idle', //'idle' | 'loading' | 'succeeded' | 'failed'
        error: null
    }

    var indexedData = null
    const GET_URL = "https://raw.githubusercontent.com/akash-aman/json/main/search.json"


    //------------------------------------------------------------------------------
    export const fetchRawData = createAsyncThunk('search/fetchRawData', async (_, thunkAPI) => {

        // ---------------------------------------------------------
        // If already hover on search field, don't fetch data again
        // ---------------------------------------------------------

        if (thunkAPI.getState().search.rawData != null) {
            return
        }

        // ----------------------------
        // fetch your data here
        // ----------------------------

        const data = await axios.get(GET_URL);


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
        thunkAPI.dispatch(setSearchField(value))

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

        //------------------------------------------------------------------------------
        // For already typed text, search for it
        //------------------------------------------------------------------------------
        if (thunkAPI.getState().search.searchQuery === "") {
            return null
        } else {
            const existedQuery = thunkAPI.getState().search.searchQuery
            return await JSON.parse(JSON.stringify(indexedData.find(existedQuery)))
        }

    })

    //------------------------------------------------------------------------------
    // async Search function from redux store
    //------------------------------------------------------------------------------
    export const setSearchResults = createAsyncThunk('search/getSearchResults', async (value, thunkAPI) => {

        thunkAPI.dispatch(setSearchQuery(value))

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
            setSearchField: (state, action) => {
                state.searchField = action.payload
            },
            setSearchQuery: (state, action) => {
                state.searchQuery = action.payload
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
                    state.searchResult = action.payload
                })
                .addCase(indexingRawData.fulfilled, (state, action) => {
                    //----------------------------------------
                    // check log for indexing Completed or not
                    //----------------------------------------
                    state.searchResult = action.payload
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



    export const getSearchResult = (state) => state.search.searchResult;
    export const getRawDataStatus = (state) => !state.search.rawData ? true : false;
    export const { setRawData, setSearchField, setSearchQuery } = searchSlice.actions

    export default searchSlice.reducer 

```

# Images

![Untitled](https://raw.githubusercontent.com/akash-aman/frontend_search/main/images/search_1.png)

![Untitled](https://raw.githubusercontent.com/akash-aman/frontend_search/main/images/search_2.png)
