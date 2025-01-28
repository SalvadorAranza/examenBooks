import React, { Component } from "react";
import Cookies from "universal-cookie";
import "bootstrap/dist/css/bootstrap.min.css";
// Importar los componentes
import Users from "../components/Users";
import Books from "../components/Books";
import Classifications from "../components/Classifications";
import Authors from "../components/Authors";
import Languages from "../components/Languages"
import Editorials from "../components/Editorials";
import Reports from "../components/Reports";
import Home from "../components/Home";

const cookies = new Cookies();

class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeSection: "home", // Sección activa inicial
        };
    }

    logout = () => {
        cookies.remove("accessToken", { path: "/" });
        window.location.href = "./";
    };

    componentDidMount() {
        if (!cookies.get("accessToken")) {
            window.location.href = "./";
        }
    }

    handleMenuClick = (section) => {
        this.setState({ activeSection: section });
    };

    renderContent = () => {
        const { activeSection } = this.state;
        switch (activeSection) {
            case "users":
                return <Users />;
            case "libros":
                return <Books />;
            case "classifications":
                return <Classifications />;
            case "authors":
                return <Authors />;
            case "languages":
                return <Languages />;
            case "editorials":
                return <Editorials />;
            case "reports":
                return <Reports />
            default:
                return <Home />;
        }
    };

    render() {
        return (
            <div className="container-fluid">
                <div className="row flex-nowrap">
                    <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
                        <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
                            <a href="/" className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                                <span className="fs-5 d-none d-sm-inline">Menu</span>
                            </a>
                            <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
                                <li>
                                    <a className="nav-link px-0 align-middle" onClick={() => this.handleMenuClick("home")}>
                                        <i className="fs-4 bi-house"></i> <span className="ms-1 d-none d-sm-inline">Home</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="nav-link px-0 align-middle" onClick={() => this.handleMenuClick("users")}>
                                        <i className="fs-4 bi-grid"></i> <span className="ms-1 d-none d-sm-inline">Usuarios</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="nav-link px-0 align-middle" onClick={() => this.handleMenuClick("libros")}>
                                        <i className="fs-4 bi-speedometer2"></i> <span className="ms-1 d-none d-sm-inline">Libros</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="nav-link px-0 align-middle" onClick={() => this.handleMenuClick("classifications")}>
                                        <i className="fs-4 bi-speedometer2"></i> <span className="ms-1 d-none d-sm-inline">Clasificaciones</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="nav-link px-0 align-middle" onClick={() => this.handleMenuClick("authors")}>
                                        <i className="fs-4 bi-speedometer2"></i> <span className="ms-1 d-none d-sm-inline">Autores</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="nav-link px-0 align-middle" onClick={() => this.handleMenuClick("languages")}>
                                        <i className="fs-4 bi-speedometer2"></i> <span className="ms-1 d-none d-sm-inline">Lenguajes</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="nav-link px-0 align-middle" onClick={() => this.handleMenuClick("editorials")}>
                                        <i className="fs-4 bi-speedometer2"></i> <span className="ms-1 d-none d-sm-inline">Editoriales</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="nav-link px-0 align-middle" onClick={() => this.handleMenuClick("reports")}>
                                        <i className="fs-4 bi-speedometer2"></i> <span className="ms-1 d-none d-sm-inline">Reportes</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="nav-link px-0 align-middle" onClick={this.logout}>
                                        <i className="fs-4 bi-people"></i> <span className="ms-1 d-none d-sm-inline">Salir</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col py-3">
                        {this.renderContent()}
                    </div>
                </div>
            </div>
        );
    }
}

export default Menu;
