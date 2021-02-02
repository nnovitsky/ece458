import React from 'react';
import InstrumentServices from "../../api/instrumentServices";

const keys = ["vendor", "model number", "serial", "short description", "most recent callibration date"];
const headers = ["Vendor", "Model", "Serial", "Description", "Last Callibration"];
const buttonText = ["More"];

let data;

const InstrumentTable = () => {
    let instrumentServices = new InstrumentServices();
    data = instrumentServices.getInstruments();
    return (
       <div>
          <h1>Instrument Table</h1>
            {makeTable()}
       </div>
    );
}

const makeTable = () => {
    let header = createHeader();
    let body = createBody();

    return (
        <Table striped bordered hover>
            <thead>
                {header}
            </thead>
            {body}

        </Table>)
}

export default InstrumentTable;