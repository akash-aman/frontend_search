import React from 'react'
import { useEffect } from 'react'
import { setSearchResults, getSearchResult } from '../state/searchSlice'
import { useDispatch, useSelector } from 'react-redux'


export default function Home() {

  const result = useSelector(getSearchResult)
  const dispatch = useDispatch()


  return (
    <div><input
      type='text'

      onChange={(e) => {
        dispatch(setSearchResults(`${e.target.value}`))
      }}
    />
      <ul>
        {
          result ? result?.map((item, i) => {
            return <li key={i}>
              <a >{item.item.title}</a>
            </li>
          }) : null
        }
      </ul>
    </div>
  )
}
