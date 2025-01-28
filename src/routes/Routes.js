import React from "react";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Login from '../pages/Login';
import Menu from "../pages/Menu";

function Routess(){
    return (
        <BrowserRouter>
            <Routes>
                <Route  exact path = '/' Component={Login}/>
                <Route  exact path = '/menu' Component={Menu}/>
            </Routes>
        </BrowserRouter>
    );
}
export default Routess;
