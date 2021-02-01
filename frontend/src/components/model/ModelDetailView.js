import React from 'react';
import { useHistory, useParams } from "react-router-dom";

import ModelServices from "../../api/modelServices";

const modelServices = new ModelServices();
let data;
let history;


const ModelDetailView = () => {
    let { pk } = useParams();
    data = modelServices.getModel(pk);
    history = useHistory();
    return (
        <div>
            <h1>Model Detail View</h1>
            <p>{data["comment"]}</p>
        </div>
    );
}

export default ModelDetailView;