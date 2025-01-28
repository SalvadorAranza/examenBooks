import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { styled } from '@mui/material/styles';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Modal, Button, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from "sweetalert2";
import { format } from 'date-fns';

const baseUrl = 'https://fronttest.cloudzeetech.org/api/languages/';
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

const Languages = () => {
    const [data, setData] = useState([]);
    const [modalInsert, setModalInsert] = useState(false);
    const [modalUpdate, setModalUpdate] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);

    const [dataLanguage, setDataLanguage] = useState({
        name: ''
    });

    const handleChange = e => {
        const { name, value } = e.target;
        setDataLanguage(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

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

    const postPetition = async () => {
        try {
            await axios.post(baseUrl, dataLanguage, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            }).then(response => {
                setData(data.concat(response.data))
                openCloseModalInsert()
            });
        } catch (error) {
            openCloseModalInsert()
            if (error.response && error.response.data) {
                if (error.response.data.message == 'name should not be empty') {
                    Swal.fire("Error!", `No se completo el registro: El campo nombre no puede estar vacio`, "error");
                }
                
            }
        }
    }

    const putPetition = async () => {
        try {
            await axios.patch(baseUrl + dataLanguage.id, dataLanguage, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            }).then(response => {
                var newData = data;
                newData.map(language => {
                    if (dataLanguage.id === language.id) {
                        language.name = dataLanguage.name;
                    }
                })
                setData(newData)
                openCloseModalUpdate()
            });
        } catch (error) {
            openCloseModalUpdate()
            if (error.response && error.response.data) {
                if (error.response.data.message == 'name should not be empty') {
                    Swal.fire("Error!", `No se completo el registro: El campo nombre no puede estar vacio`, "error");
                }
                
            }
        }
    }

    const deletePetition = async () => {
        try {
            await axios.delete(baseUrl + dataLanguage.id, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            }).then(response => {
                setData(data.filter(language => language.id !== dataLanguage.id));
                openCloseModalDelete()
            });
        } catch (error) {
            openCloseModalDelete()
            Swal.fire("Atención!", `Error al eliminar el idioma: ${dataLanguage.name}, ${error.message}`, "error");
        }
    }

    const openCloseModalInsert = () => {
        setModalInsert(!modalInsert);
    };

    const openCloseModalUpdate = () => {
        setModalUpdate(!modalUpdate);
    };

    const openCloseModalDelete = () => {
        setModalDelete(!modalDelete);
    };

    const selectDataLanguage = (language, caso) => {
        setDataLanguage(language);
        (caso === 'Edit') ? setModalUpdate(true) : openCloseModalDelete()
    }

    useEffect(() => {
        petitionGet();
    }, []);

    const bodyInsert = (
        <ModalStyle>
            <h3>Agregar Idioma</h3>
            <br />
            <TextField name="name" fullWidth label="Nombre" onChange={handleChange} />
            <br />
            <div style={{ textAlign: 'right' }}>
                <Button color="primary" onClick={() => postPetition()}>Insertar</Button>
                <Button onClick={() => openCloseModalInsert()}>Cancelar</Button>
            </div>
        </ModalStyle>
    );

    const bodyUpdate = (
        <ModalStyle>
            <h3>Editar Idioma</h3>
            <br />
            <TextField name="name" fullWidth label="Nombre" onChange={handleChange} value={dataLanguage && dataLanguage.name} />
            <br />
            <div style={{ textAlign: 'right' }}>
                <Button color="primary" onClick={() => putPetition()}>Actualizar</Button>
                <Button onClick={() => openCloseModalUpdate()}>Cancelar</Button>
            </div>
        </ModalStyle>
    );

    const bodyDelete = (
        <ModalStyle>
            <h3>Eliminar Idioma</h3>
            <br />
            <p>¿Estás seguro de eliminar <b>{dataLanguage && dataLanguage.name}</b>?</p>
            <br />
            <div style={{ textAlign: 'right' }}>
                <Button color="danger" onClick={() => deletePetition()}>Eliminar</Button>
                <Button onClick={() => openCloseModalDelete()}>Cancelar</Button>
            </div>
        </ModalStyle>
    );

    return (
        <div>
            <h1>Contenido de Idiomas</h1>
            <br />
            <Button onClick={() => openCloseModalInsert()} variant="contained" color="primary">
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
                        {data.map((language) => (
                            <TableRow key={language.id}>
                                <TableCell>{language.name}</TableCell>
                                <TableCell>{format(new Date(language.createdAt), 'yyyy/MM/dd HH:mm')}</TableCell>
                                <TableCell>
                                    <EditIcon style={{ cursor: 'pointer' }} onClick={() => selectDataLanguage(language, 'Edit')} />
                                    &nbsp;
                                    <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => selectDataLanguage(language, 'Delete')} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Modal open={modalInsert} onClose={() => openCloseModalInsert()}>
                {bodyInsert}
            </Modal>

            <Modal open={modalUpdate} onClose={() => openCloseModalUpdate()}>
                {bodyUpdate}
            </Modal>

            <Modal open={modalDelete} onClose={() => openCloseModalDelete()}>
                {bodyDelete}
            </Modal>
        </div>
    );
};

export default Languages;
