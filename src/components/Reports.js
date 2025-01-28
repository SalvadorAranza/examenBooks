import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Cookies from "universal-cookie";
import { format } from "date-fns";

const baseUrl = "https://fronttest.cloudzeetech.org/api/users/reports/book_loan";

const Reports = () => {
    const [data, setData] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const cookies = new Cookies();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(baseUrl, {
                    headers: {
                        'Authorization': `Bearer ${cookies.get('accessToken')}`
                    }
                });
                setData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [cookies]);

    const filteredData =
        selectedUser === ""
            ? data.flatMap((user) =>
                user.users_book.length === 0
                    ? [{
                        userName: user.name,
                        bookName: "Sin libro",
                        returnDate: "N/A",
                        unpaid: "0.00",
                    }]
                    : user.users_book.map((book) => ({
                        userName: user.name,
                        bookName: book.book.name,
                        returnDate: book.return_date,
                        unpaid: book.unpaid,
                    }))
            )
            : data
                .filter((user) => user.name === selectedUser)
                .flatMap((user) =>
                    user.users_book.length === 0
                        ? [{
                            userName: user.name,
                            bookName: "Sin libro",
                            returnDate: "N/A",
                            unpaid: "0.00",
                        }]
                        : user.users_book.map((book) => ({
                            userName: user.name,
                            bookName: book.book.name,
                            returnDate: book.return_date,
                            unpaid: book.unpaid,
                        }))
                );

    const users = data.map((user) => user.name);

    const hasBooksAssigned = filteredData.some(item => item.bookName !== "Sin libro");

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Books Report");
        XLSX.writeFile(workbook, "books_report.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Books Report", 20, 10);
        doc.autoTable({
            head: [["User", "Book Name", "Return Date", "Unpaid"]],
            body: filteredData.map((item) => [
                item.userName,
                item.bookName,
                item.returnDate === "N/A" ? item.returnDate : format(new Date(item.returnDate), 'yyyy/MM/dd HH:mm'),
                `$${item.unpaid || "0.00"}`,
            ]),
        });
        doc.save("books_report.pdf");
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Reporte de libros </h1>

            <div className="mb-4">
                <label className="mr-2">Filtrar por usuario</label> &nbsp;&nbsp;
                <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="border rounded px-2 py-1"
                >
                    <option value="">Todos los usuarios</option>
                    {users.map((user, index) => (
                        <option key={index} value={user}>
                            {user}
                        </option>
                    ))}
                </select>
            </div>

            <table className="table-auto w-full mb-4 border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-2 py-1">Usuario</th>
                        <th className="border border-gray-300 px-2 py-1">Libro</th>
                        <th className="border border-gray-300 px-2 py-1">Fecha de regreso</th>
                        <th className="border border-gray-300 px-2 py-1">Sin pagar</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, index) => (
                        <tr key={index}>
                            <td className="border border-gray-300 px-2 py-1">{item.userName}</td>
                            <td className="border border-gray-300 px-2 py-1">{item.bookName}</td>
                            <td className="border border-gray-300 px-2 py-1">
                                {item.returnDate === "N/A"
                                    ? item.returnDate
                                    : format(new Date(item.returnDate), 'yyyy/MM/dd HH:mm')}
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                                ${item.unpaid || "0.00"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {hasBooksAssigned && (
                <div className="flex gap-4">
                    <button
                        onClick={exportToExcel}
                        className="btn btn-warning"
                    >
                        Reporte en Excel
                    </button>&nbsp;&nbsp;&nbsp;&nbsp;
                    <button
                        onClick={exportToPDF}
                        className="btn btn-info"
                    >
                        Reporte en PDF
                    </button>
                </div>
            )}
        </div>
    );
};

export default Reports;
