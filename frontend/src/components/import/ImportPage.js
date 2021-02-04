import React from 'react';
import './ImportPage.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';

 
class importPage extends React.Component {
    render() {
        return (
            <div className="column-div">
                <div className="left-column">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="main-div">
                    <h2>Import</h2>
                </div>
            </div>


        );
    }
}
 
export default importPage;