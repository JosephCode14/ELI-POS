

import React from 'react'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



export default function ProtectedRoutes({ children }) {

    const navigate = useNavigate()

    useEffect(() => {
      console.log(localStorage.getItem('accessToken'));
      if(localStorage.getItem('accessToken') === null){
        navigate('/');
      }
    }, [navigate])

    return <>{ children }</>
}
