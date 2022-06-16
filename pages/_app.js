import '../styles/globals.css'
import { fetchRawData } from '../state/searchSlice'
import { store } from '../redux/store'
import { Provider } from 'react-redux'

//store.dispatch(fetchRawData())
function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider >
  )
}

export default MyApp
