import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { styled } from '@mui/material/styles';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Modal, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from "sweetalert2";
import { format } from 'date-fns';

const baseUrl = 'https://fronttest.cloudzeetech.org/api/books';
const urlEditorials = 'https://fronttest.cloudzeetech.org/api/editorials/';
const urlLanguages = 'https://fronttest.cloudzeetech.org/api/languages/';
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

const Books = () => {
    const [data, setData] = useState([]);
    const [editorials, setEditorials] = useState([]);
    const [languages, setLanguages] = useState({});
    const [modalInsert, setModalInsert] = useState(false);
    const [modalUpdate, setModalUpdate] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);

    const [dataBook, setDataBook] = useState({
        name: '',
        ISBN: '',
        editorial_id: '',
        pages: 0,
        language_id: '',
        publication_date: '2025-01-28'
    });

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = data.filter((book) =>
        book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.ISBN.includes(searchTerm)
    );

    const [errors, setErrors] = useState({
        name: '',
        ISBN: '', 
        pages : ''
    });

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === "ISBN") {
            // Remover caracteres no numéricos
            const numericValue = value.replace(/\D/g, "");
    
            // Aplicar formato ISBN-13 (978-X-XXXXX-XXX-X)
            const formattedISBN = numericValue
                .replace(/(\d{3})(\d{1})?(\d{5})?(\d{3})?(\d{1})?/, (match, p1, p2, p3, p4, p5) => {
                    return [p1, p2, p3, p4, p5].filter(Boolean).join("-");
                })
                .substr(0, 17); // Limitar la longitud máxima con guiones
    
            setDataBook((prevState) => ({
                ...prevState,
                [name]: formattedISBN,
            }));
        } else {
            setDataBook((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!dataBook.name) {
            newErrors.name = 'El nombre es requerido';
        }
        if (!dataBook.ISBN) {
            newErrors.ISBN = "El ISBN es requerido";
        } else if (!/^\d{3}-\d{1}-\d{5}-\d{3}-\d{1}$/.test(dataBook.ISBN)) {
            newErrors.ISBN = "El ISBN debe tener el formato 978-X-XXXXX-XXX-X";
        }

        if (!dataBook.pages) {
            newErrors.pages = 'Las paginas son requeridas';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const petitionGet = async () => {
        try {
            const response = await axios.get(baseUrl + '?include=editorial', {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            });
            setData(response.data.rows);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const getEditorialsPetition = async () => {
        try {
            const response = await axios.get(urlEditorials, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            });
            setEditorials(response.data.rows);
        } catch (e) {
            console.error("Error fetching data editorials: ", e);
        }
    };

    const getLanguagesPetition = async () => {
        try {
            const response = await axios.get(urlLanguages, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            });
            setLanguages(response.data.rows);
        } catch (e) {
            console.error("Error fetching data languages: ", e);
        }
    };

    const postPetition = async () => {
        if (!validateForm()) return;

        try {
            await axios.post(baseUrl, dataBook, {
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
                switch (error.response.data.message) {
                    case 'name should not be empty' :
                        Swal.fire("Error!", `No se completo el registro: El campo nombre no puede estar vacio`, "error");
                        break;
                    case 'ISBN must be an ISBN"':
                        Swal.fire("Error!", `El formato ISBN no es el correcto, por favor, ingrese uno valido`, "error");
                    default:
                        break;
                }
            }
        }
    };

    const putPetition = async () => {
        if (!validateForm()) return;

        try {
            await axios.patch(baseUrl + '/' + dataBook.id, dataBook, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            }).then(response => {
                var newData = data.map(book => {
                    if (dataBook.id == book.id) {
                        return { ...book, ...dataBook };
                    }
                    return book;
                });
                setData(newData);
                openCloseModalUpdate();
            });

        } catch (error) {
            openCloseModalUpdate();
            Swal.fire("Alerta!", `Error al actualizar: ${dataBook.name}, ${error.message}`, "warning");
        }

    };

    const deletePetition = async () => {
        try {
            await axios.delete(baseUrl + '/' + dataBook.id, {
                headers: {
                    'Authorization': `Bearer ${cookies.get('accessToken')}`
                }
            }).then(response => {
                setData(data.filter(book => book.id != dataBook.id));
                openCloseModalDelete();
            });
        } catch (error) {
            openCloseModalDelete();
            Swal.fire("Atención!", `Error al eliminar Usuario: ${dataBook.name}, ${error.message}`, "error");
        }

    };

    const openCloseModalInsert = () => {
        setModalInsert(!modalInsert);
        setDataBook({
            name: '',
            ISBN: '',
            editorial_id: '',
            pages: 0,
            language_id: '',
            publication_date: '2025-01-28'
        });
        setErrors({});
    };

    const openCloseModalUpdate = () => {
        setModalUpdate(!modalUpdate);
        setDataBook({
            name: '',
            ISBN: '',
            editorial_id: '',
            pages: 0,
            language_id: '',
            publication_date: '2025-01-28'
        });
        setErrors({});
    };

    const openCloseModalDelete = () => {
        setModalDelete(!modalDelete);
        setDataBook({
            name: '',
            ISBN: '',
            editorial_id: '',
            pages: 0,
            language_id: '',
            publication_date: '2025-01-28'
        });
    };

    const selectDataBook = (book, caso) => {
        setDataBook(book);
        if (caso === 'Edit') {
            setModalUpdate(true);
        } else if (caso === 'Delete') {
            setModalDelete(true);
        }
    };

    useEffect(() => {
        petitionGet();
        getEditorialsPetition();
        getLanguagesPetition();
    }, []);

    const bodyInsert = (
        <ModalStyle>
            <h3>Agregar Libro</h3>
            <TextField
                name="name"
                fullWidth
                label="Nombre"
                onChange={handleChange}
                value={dataBook.name}
                sx={{ mb: 2 }}
                error={!!errors.name}
                helperText={errors.name}
            />
            <TextField
                name="ISBN"
                fullWidth
                label="ISBN"
                onChange={handleChange}
                value={dataBook.ISBN}
                sx={{ mb: 2 }}
                error={!!errors.ISBN}
                helperText={errors.ISBN}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Editorial</InputLabel>
                <Select
                    name="editorial_id"
                    value={dataBook.editorial_id || ''}
                    onChange={handleChange}
                    label="Editorial"
                >
                    <MenuItem value="" disabled>Selecciona una editorial</MenuItem>
                    {Array.isArray(editorials) && editorials.map((editorial) => (
                        <MenuItem key={editorial.id} value={editorial.id}>
                            {editorial.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField name="pages" fullWidth label="Paginas" onChange={handleChange} sx={{ mb: 2 }} error={!!errors.pages} helperText={errors.pages} />
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Lenguaje</InputLabel>
                <Select
                    name="language_id"
                    value={dataBook.language_id || ''}
                    onChange={handleChange}
                    label="Lenguaje"
                >
                    <MenuItem value="" disabled>Selecciona un lenguaje</MenuItem>
                    {Array.isArray(languages) && languages.map((language) => (
                        <MenuItem key={language.id} value={language.id}>
                            {language.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <div style={{ textAlign: 'right' }}>
                <Button color="primary" onClick={postPetition}>Insertar</Button>
                <Button onClick={openCloseModalInsert}>Cancelar</Button>
            </div>
        </ModalStyle>
    );

    const bodyUpdate = (
        <ModalStyle>
            <h3>Editar Libro</h3>
            <br />
            <TextField
                name="name"
                fullWidth
                label="Nombre"
                onChange={handleChange}
                value={dataBook.name}
                sx={{ mb: 2 }}
                error={!!errors.name}
                helperText={errors.name}
            />
            <TextField
                name="ISBN"
                fullWidth
                label="ISBN"
                onChange={handleChange}
                value={dataBook.ISBN}
                sx={{ mb: 2 }}
                error={!!errors.ISBN}
                helperText={errors.ISBN}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Editorial</InputLabel>
                <Select
                    name="editorial_id"
                    value={dataBook.editorial_id || ''}
                    onChange={handleChange}
                    label="Editorial"
                >
                    <MenuItem value="" disabled>Selecciona una editorial</MenuItem>
                    {Array.isArray(editorials) && editorials.map((editorial) => (
                        <MenuItem key={editorial.id} value={editorial.id}>
                            {editorial.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField name="pages" fullWidth label="Paginas" value={dataBook.pages} onChange={handleChange} sx={{ mb: 2 }} error={!!errors.pages} helperText={errors.pages}/>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Lenguaje</InputLabel>
                <Select
                    name="language_id"
                    value={dataBook.language_id || ''}
                    onChange={handleChange}
                    label="Lenguaje"
                >
                    <MenuItem value="" disabled>Selecciona un lenguaje</MenuItem>
                    {Array.isArray(languages) && languages.map((language) => (
                        <MenuItem key={language.id} value={language.id}>
                            {language.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <br />
            <div style={{ textAlign: 'right' }}>
                <Button color="primary" onClick={putPetition}>Actualizar</Button>
                <Button onClick={openCloseModalUpdate}>Cancelar</Button>
            </div>
        </ModalStyle>
    );

    const bodyDelete = (
        <ModalStyle>
            <h3>Eliminar Libro</h3>
            <br />
            <p>¿Estas seguro de eliminar <b>{dataBook && dataBook.name}</b>?</p>
            <br />
            <div style={{ textAlign: 'right' }}>
                <Button color="danger" onClick={deletePetition}>Eliminar</Button>
                <Button onClick={openCloseModalDelete}>Cancelar</Button>
            </div>
        </ModalStyle>
    );

    return (
        <div>
            <h1>Contenido de Libros</h1>
            <TextField
                label="Buscar Libro"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ mb: 2 }}
            />
            <br />
            <Button onClick={openCloseModalInsert} variant="contained" color="primary">
                Insertar
            </Button>
            <br />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ textAlign: 'center' }}>Nombre</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>ISBN</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>Editorial</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>Paginas</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>Fecha Publicación</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>Opciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((libro) => (
                            <TableRow key={libro.id}>
                                <TableCell style={{ textAlign: 'center' }}>{libro.name}</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>{libro.ISBN}</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>{libro.editorial ? libro.editorial.name : 'Sin editorial'}</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>{libro.pages}</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>{format(new Date(libro.publication_date), 'yyyy/MM/dd')}</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>
                                    <EditIcon style={{ cursor: 'pointer' }} onClick={() => selectDataBook(libro, 'Edit')} />
                                    &nbsp;
                                    <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => selectDataBook(libro, 'Delete')} />
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
        </div>
    );
};

export default Books;
