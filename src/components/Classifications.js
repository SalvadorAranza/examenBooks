import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { styled } from '@mui/material/styles';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Modal, Button, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from "sweetalert2";
import { format } from 'date-fns';

const baseUrl = 'https://fronttest.cloudzeetech.org/api/classifications/';
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

const Classifications = () => {
    const [data, setData] = useState([]);
    const [modalInsert, setModalInsert] = useState(false);
    const [modalUpdate, setModalUpdate] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);

    const [dataClassification, setDataClassification] = useState({
        name: ''
    });

    const handleChange = e => {
        const { name, value } = e.target;
        setDataClassification(prevState => ({
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
            await axios.post(baseUrl, dataClassification, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            }).then(response => {
                setData(data.concat(response.data))
                openCloseModalInsert()
            });
        } catch (error) {
            openCloseModalInsert()
            Swal.fire("Atención!", `Error al Insertar la clasificación, ${error.message}`, "error");
        }
    }

    const putPetition = async () => {
        try {
            await axios.patch(baseUrl + dataClassification.id, dataClassification, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            }).then(response => {
                var newData = data;
                newData.map(classification => {
                    if (dataClassification.id === classification.id) {
                        classification.name = dataClassification.name;
                    }
                })
                setData(newData)
                openCloseModalUpdate()
            });
        } catch (error) {
            openCloseModalUpdate()
            Swal.fire("Alerta!", `Error al actualizar: ${dataClassification.name}, ${error.message}`, "warning");
        }
    }

    const deletePetition = async () => {
        try {
            await axios.delete(baseUrl + dataClassification.id, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            }).then(response => {
                setData(data.filter(classification => classification.id !== dataClassification.id));
                openCloseModalDelete()
            });
        } catch (error) {
            openCloseModalDelete()
            Swal.fire("Atención!", `Error al eliminar la clasificación: ${dataClassification.name}, ${error.message}`, "error");
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

    const selectDataClassification = (classification, caso) => {
        setDataClassification(classification);
        (caso === 'Edit') ? setModalUpdate(true) : openCloseModalDelete()
    }

    useEffect(() => {
        petitionGet();
    }, []);

    const bodyInsert = (
        <ModalStyle>
            <h3>Agregar Clasificación</h3>
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
            <h3>Editar Clasificación</h3>
            <br />
            <TextField name="name" fullWidth label="Nombre" onChange={handleChange} value={dataClassification && dataClassification.name} />
            <br />
            <div style={{ textAlign: 'right' }}>
                <Button color="primary" onClick={() => putPetition()}>Actualizar</Button>
                <Button onClick={() => openCloseModalUpdate()}>Cancelar</Button>
            </div>
        </ModalStyle>
    );

    const bodyDelete = (
        <ModalStyle>
            <h3>Eliminar Clasificación</h3>
            <br />
            <p>¿Estás seguro de eliminar <b>{dataClassification && dataClassification.name}</b>?</p>
            <br />
            <div style={{ textAlign: 'right' }}>
                <Button color="danger" onClick={() => deletePetition()}>Eliminar</Button>
                <Button onClick={() => openCloseModalDelete()}>Cancelar</Button>
            </div>
        </ModalStyle>
    );

    return (
        <div>
            <h1>Contenido de Clasificaciones</h1>
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
                        {data.map((classification) => (
                            <TableRow key={classification.id}>
                                <TableCell>{classification.name}</TableCell>
                                <TableCell>{format(new Date(classification.createdAt), 'yyyy/MM/dd HH:mm')}</TableCell>
                                <TableCell>
                                    <EditIcon style={{ cursor: 'pointer' }} onClick={() => selectDataClassification(classification, 'Edit')} />
                                    &nbsp;
                                    <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => selectDataClassification(classification, 'Delete')} />
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

export default Classifications;
