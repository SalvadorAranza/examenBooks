import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { styled } from '@mui/material/styles';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Modal, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BookIcon from '@mui/icons-material/Book';
import Swal from "sweetalert2";
import { format } from 'date-fns';

const baseUrl = 'https://fronttest.cloudzeetech.org/api/users/';
const booksUrl = 'https://fronttest.cloudzeetech.org/api/books/';
const cookies = new Cookies();

const ModalStyle = styled('div')(({ theme }) => ({
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
}));

const Users = () => {
    const [data, setData] = useState([]);
    const [books, setBooks] = useState([]);
    const [modalInsert, setModalInsert] = useState(false);
    const [modalUpdate, setModalUpdate] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalAssign, setModalAssign] = useState(false);

    const [dataUser, setDataUser] = useState({
        name: ''
    });

    const [dataBook, setDataBook] = useState({
        user_id: '',
        book_id: ''
    });

    const handleChange = e => {
        const { name, value } = e.target;
        setDataUser(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleBookChange = e => {
        const { name, value } = e.target;
        setDataBook(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const petitionGet = async () => {
        try {
            const response = await axios.get(baseUrl, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            });
            setData(response.data.rows);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const getBooksPetition = async () => {
        try {
            const response = await axios.get(booksUrl, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            });
            setBooks(response.data.rows);
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    };

    const postPetition = async () => {
        try {
            await axios.post(baseUrl, dataUser, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            }).then(response => {
                setData(data.concat(response.data));
                openCloseModalInsert();
            });
        } catch (error) {
            openCloseModalInsert();
            if (error.response && error.response.data) {
                if (error.response.data.message == 'name should not be empty') {
                    Swal.fire("Error!", `No se completo el registro: El campo nombre no puede estar vacio`, "error");
                }
                
            }
        }
    };

    const putPetition = async () => {
        try {
            await axios.patch(baseUrl + dataUser.id, dataUser, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            }).then(response => {
                var newData = data;
                newData.map(usuario => {
                    if (dataUser.id === usuario.id) {
                        usuario.name = dataUser.name;
                    }
                });
                setData(newData);
                openCloseModalUpdate();
            });
        } catch (error) {
            openCloseModalUpdate();
            if (error.response && error.response.data) {
                if (error.response.data.message == 'name should not be empty') {
                    Swal.fire("Error!", `No se completo el registro: El campo nombre no puede estar vacio`, "error");
                }
                
            }
        }
    };

    const deletePetition = async () => {
        try {
            await axios.delete(baseUrl + dataUser.id, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            }).then(response => {
                setData(data.filter(usuario => usuario.id !== dataUser.id));
                openCloseModalDelete();
            });
        } catch (error) {
            openCloseModalDelete();
            Swal.fire("Atención!", `Error al eliminar Usuario: ${dataUser.name}, ${error.message}`, "error");
        }
    };

    const assignBookToUser = async () => {

        await axios.post('https://fronttest.cloudzeetech.org/api/users-books/', dataBook, {
            headers: {
                'Authorization': `Bearer ${cookies.get('accessToken')}`
            }
        }).then(response => {
            Swal.fire("Éxito!", "Libro asignado correctamente", "success");
            openCloseModalAssign();
        }).catch(error=>{
            if (error.response && error.response.data) {
                Swal.fire("Error!", `No se pudo asignar el libro: ${error.response.data.message}`, "error");
            }
            openCloseModalAssign();
        });
        
    };

    const openCloseModalInsert = () => {
        setModalInsert(!modalInsert);
    };

    const openCloseModalUpdate = () => {
        setModalUpdate(!modalUpdate);
    };

    const openCloseModalDelete = () => {
        setModalDelete(!modalDelete);
    };

    const openCloseModalAssign = () => {
        setModalAssign(!modalAssign);

    };

    const selectDataUser = (consola, caso) => {
        setDataUser(consola);
        if (caso === 'Edit') {
            setModalUpdate(true);
        } else if (caso === 'Assign') {
            setDataBook(prevState => ({
                ...prevState,
                user_id: consola.id
            }));
            openCloseModalAssign();
        } else {
            openCloseModalDelete();
        }
    };

    useEffect(() => {
        petitionGet();
        getBooksPetition();
    }, []);

    const bodyAssignBook = (
        <ModalStyle>
            <h3>Asignar Libro</h3>
            <br />
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Libros</InputLabel>
                <Select
                    name="book_id"
                    value={dataBook.book_id}
                    onChange={handleBookChange}
                >
                    <MenuItem value="" disabled>Selecciona un Libro</MenuItem>
                    {books.map((book) => (
                        <MenuItem key={book.id} value={book.id}>{book.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <br />
            <div style={{ textAlign: 'right' }}>
                <Button color="primary" onClick={assignBookToUser}>Asignar</Button>
                <Button onClick={openCloseModalAssign}>Cancelar</Button>
            </div>
        </ModalStyle>
    );

    const bodyInsert = (
        <ModalStyle>
            <h3>Agregar Usuario</h3>
            <br />
            <TextField name="name" fullWidth label="Nombre" onChange={handleChange} />
            <br />
            <div style={{ textAlign: 'right' }}>
                <Button color="primary" onClick={postPetition}>Insertar</Button>
                <Button onClick={openCloseModalInsert}>Cancelar</Button>
            </div>
        </ModalStyle>
    );

    const bodyUpdate = (
        <ModalStyle>
            <h3>Editar Usuario</h3>
            <br />
            <TextField name="name" fullWidth label="Nombre" onChange={handleChange} value={dataUser && dataUser.name} />
            <br />
            <div style={{ textAlign: 'right' }}>
                <Button color="primary" onClick={putPetition}>Actualizar</Button>
                <Button onClick={openCloseModalUpdate}>Cancelar</Button>
            </div>
        </ModalStyle>
    );

    const bodyDelete = (
        <ModalStyle>
            <h3>Eliminar Usuario</h3>
            <br />
            <p>¿Estás seguro de eliminar <b>{dataUser && dataUser.name}</b>?</p>
            <br />
            <div style={{ textAlign: 'right' }}>
                <Button color="danger" onClick={deletePetition}>Eliminar</Button>
                <Button onClick={openCloseModalDelete}>Cancelar</Button>
            </div>
        </ModalStyle>
    );

    return (
        <div>
            <h1>Contenido de Usuarios</h1>
            <br />
            <Button onClick={openCloseModalInsert} variant="contained" color="primary">
                Insertar
            </Button>
            <br />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Fecha Registro</TableCell>
                            <TableCell>Opciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((usuario) => (
                            <TableRow key={usuario.id}>
                                <TableCell>{usuario.name}</TableCell>
                                <TableCell>{format(new Date(usuario.createdAt), 'yyyy/MM/dd HH:mm')}</TableCell>
                                <TableCell>
                                    <BookIcon onClick={() => selectDataUser(usuario, 'Assign')}/>
                                    &nbsp;
                                    <EditIcon style={{ cursor: 'pointer' }} onClick={() => selectDataUser(usuario, 'Edit')} />
                                    &nbsp;
                                    <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => selectDataUser(usuario, 'Delete')} />
                                    &nbsp;
                                    
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Modal open={modalInsert} onClose={openCloseModalInsert}>
                {bodyInsert}
            </Modal>

            <Modal open={modalUpdate} onClose={openCloseModalUpdate}>
                {bodyUpdate}
            </Modal>

            <Modal open={modalDelete} onClose={openCloseModalDelete}>
                {bodyDelete}
            </Modal>

            <Modal open={modalAssign} onClose={openCloseModalAssign}>
                {bodyAssignBook}
            </Modal>
        </div>
    );
};

export default Users;
