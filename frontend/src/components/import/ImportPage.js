import React, { Component } from 'react';
import './ImportPage.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import GenericTable from '../generic/GenericTable';
import instramentData from "./import_holder_data.json";
import myInstructions from './ImportInstructions.js';


const keys = ["type", "model number", "serial"];
const headers = ["Type", "Model Number", "Serial Number", "More"];
const buttonText = ["More"];
const importInstructions = myInstructions;
let data = instramentData.tools;


class ImportPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            error_message: ''
          }

    }

    render() {return (
            <div class="background">
                <div class="row mainContent">
                    <div class="col-2 text-center"><img src={logo} alt="Logo" /></div>
                    <div class="col-5"><h2>Import</h2>
                    <form class="text-center" method="post" action="#" id="#">
                    <div class="form-group files">
                        <label>Upload Your File</label>
                        <input type="file" class="form-control" multiple="" onChange={this.onUpload}></input>
                    </div>
                    </form>
                        <h5 class="text-center">{this.state.error_message}</h5>
                        <button class="bigButton" onClick={this.importClicked}>Import</button>
                        <div class="instructions">
                            <h3>How to Import</h3>
                            <p>{importInstructions}</p>
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
                        <GenericTable data={data} keys={keys} headers={headers} buttonText={buttonText} buttonFunctions={[this.onEntryClicked]} />
                    </div>
                </div>
            </div>

        );
    }

    onUpload = (e) => {
        console.log(e.target.files[0])
        this.setState({
            selectedFile: e.target.files[0],
            error_message: ''
        })
    }

    importClicked = (e) => {
        if(this.state.selectedFile !== null && typeof(this.state.selectedFile) !== 'undefined')
        {
            console.log(this.state.selectedFile.name)
            console.log(this.state.selectedFile.type)
            this.setState({
                error_message: 'Uploding File...'
            })
        }
        else
        {
            this.setState({
                error_message: "Error: No file chosen"
            })
        }
    }

    onEntryClicked= (e) => {
        console.log("Clicked Entry");
    }
}

export default ImportPage;