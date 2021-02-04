import React from 'react';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import logo from '../../assets/HPT_logo_crop.png';
import { useParams } from "react-router-dom";

import InstrumentServices from "../../api/instrumentServices";

const instrumentServices = new InstrumentServices();
let detailData;
//let history;


const InstrumentDetailView = () => {
    let { pk } = useParams();
    //detailData = instrumentServices.get(pk);
    //history = useHistory();
    return (
        <div className="column-div">
            <div className="left-column">
                <img src={logo} alt="Logo" />
            </div>
            <div className="main-div">
                <h1>Instrument detail view</h1>
            </div>
        </div>

    );
}

// const makeDetailsTable = () => {
//     return (
//         <Table bordered hover>
//             <tbody>
//                 <tr>
//                     <td><strong>Vendor: </strong>{detailData["vendor"]}</td>
//                 </tr>
//                 <tr>
//                     <td><strong>Model: </strong>{detailData["model number"]}</td>
//                 </tr>
//                 <tr>
//                     <td><strong>Description: </strong>{detailData["description"]}</td>
//                 </tr>
//                 <tr>
//                     <td><strong>Comment: </strong>{detailData["comment"]}</td>
//                 </tr>
//             </tbody>
//         </Table>
//     )
// }

export default InstrumentDetailView;