import { Component } from "react";
import { useState } from 'react';
import '../css/Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import Cookies from "universal-cookie";

const baseUrl = 'https://fronttest.cloudzeetech.org/api/administrators/auth/login';
const cookies = new Cookies();

class Login extends Component {

    state = {
        form:{
            username: '',
            password: ''
        }
    }

    handleChange = async e=>{
        await this.setState({
            form:{
                ...this.state.form,
                [e.target.name]: e.target.value
            }
        });
    }

    login = async () => {
        const param = { 
          username: this.state.form.username, 
          password: this.state.form.password
        };

        try {
          const response = await axios.post(baseUrl, param)
          .then(response=>{

            return response.data;
            
          })
          .then(response=>{
            
            if (response.statusCode != 401) {
                cookies.set('accessToken', response.accessToken, {path: "/"});
                window.location.href =  "./menu";
            }else{
                alert('El usuario o la contraseña son inconrrectos');
            }
          });
        } catch (error) {
          if (error.response) {
            alert("Error en la respuesta: " + error.response.data.message);
          } else if (error.request) {
            console.error("Sin respuesta del servidor:", error.request);
          } else {
            console.error("Error al configurar la solicitud:", error.message);
          }
        }
      };
      
    componentDidMount(){
        if (cookies.get('accessToken')) {
            window.location.href =  "./menu";
            
        }
    }
    render(){
        return(
            <div className="containerPrincipal">
                <div className="containerSecunadrio">
                    <div className="form-group">
                        <label>Usuario:</label>
                        <br/>
                        <input type="text" className="form-control" name="username" onChange={this.handleChange}/>
                        <br/>
                        <label>Contraseña:</label>
                        <br/>
                        <input type="password" className="form-control" name="password" onChange={this.handleChange}/>
                        <br/>
                        <button className="btn btn-primary" onClick={()=> this.login()}>Iniciar Sesión</button>
                    </div>
                </div>
            </div>
        );
    }
}
export default Login;