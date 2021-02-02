import React from 'react';
import './UserProfilePage.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';

 
class user extends React.Component {
    render() {
        return (
            <div className="column-div">
                <div className="left-column">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="main-div">
                    <h2>Hello, User</h2>
                    <button>Change Display Name</button>
                    <button>Change Email</button>
                </div>
            </div>


        );
    }
}
 
export default user;