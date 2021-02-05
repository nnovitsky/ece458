import React from 'react';
import './ImportPage.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import GenericTable from '../generic/GenericTable';
import instramentData from "./import_holder_data.json";


const keys = ["type", "model number", "serial"];
const headers = ["Type", "Model Number", "Serial Number", "More"];
const buttonText = ["More"];


const ImportPage = () => {
    let data = instramentData.tools;
    let buttonFunctions = [onEntryClicked]

        return (
            <div class="background">
                <div class="row mainContent">
                    <div class="col-2 text-center"><img src={logo} alt="Logo" /></div>
                    <div class="col-5"><h2>Import</h2>
                        <button class="bigButton">Choose File</button>
                        <button class="bigButton">Import</button>
                        <div class="instructions">
                            <h3>How to Import</h3>
                            <p>
                                A bunch of text describing how to import a file.
                                Right now this text is living in the html but 
                                it should really be read from a document in the backend.
                                This <a href="https://social.msdn.microsoft.com/Forums/en-US/64ea2d16-7594-400b-8b25-8b3b9a078eab/read-external-text-file-with-javascript?forum=sidebargadfetdevelopment">link </a> 
                                should help us be able to parse words from a doc into html.
                            </p>
                        </div>
                    </div>
                    <div class="col-4 leftText">
                    <h2>Summary</h2>
                    <div class="summary overflow-auto">
                            <p>
                                Status: In Progress/Success/Errors
                                <br></br>
                                <br></br>
                                Records Count: All of the text in here needs to be generated
                                based on what the result of the inport is. Guessing the number
                                of errors/successes will be genrated in the backend and we 
                                will need to parse a JSON describing this event.
                            </p>
                        </div>
                        <GenericTable data={data} keys={keys} headers={headers} buttonText={buttonText} buttonFunctions={buttonFunctions} />
                    </div>
                </div>
            </div>


        );
    }

    const onEntryClicked= (e) => {
        console.log("Clicked Entry");
    }

export default ImportPage;