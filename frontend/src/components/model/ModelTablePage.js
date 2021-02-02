import React from 'react';
import { useHistory } from "react-router-dom";
import ModelServices from "../../api/modelServices";
import GenericTable from '../generic/GenericTable';

let history;
const modelServices = new ModelServices();

const keys = ["model number", "vendor", "description", "callibration frequency"];
const headers = ["Model Number", "Vendor", "Description", "Callibration (days)", "More"];
const buttonText = ["More"];

const ModelTable = () => {
    let data = modelServices.getModels();
    let buttonFunctions = [onDetailClicked]
    history = useHistory(data);
    return (
        <div>
            <h1>Model Table</h1>
            <GenericTable data={data} keys={keys} headers={headers} buttonText={buttonText} buttonFunctions={buttonFunctions} />
        </div>
    );
}

const onDetailClicked = (e) => {
    history.push(`/models/${e.target.value}`);
}

export default ModelTable;