//import logo from './logo.svg';
import './App.css';

import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import LoginPage from './components/login/LoginPage';
import AdminPage from './components/admin/AdminPage';
import UserProfilePage from './components/user/UserProfilePage';
import ModelTablePage from './components/model/ModelTablePage';
import InstrumentTablePage from './components/instrument/InstrumentTablePage';
import Navigation from './components/Navigation';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      displayed_form: '',
      logged_in: localStorage.getItem('token') ? true : false,
      username: ''
    };
  }


  render() {
    return (      
       <BrowserRouter>
        <div>
          <Navigation />
            <Switch>
             <Route path="/" component={LoginPage} exact/>
             <Route path="/model-table" component={ModelTablePage} exact/>
             <Route path="/instrument-table" component={InstrumentTablePage} exact/>
             <Route path="/user-profile" component={UserProfilePage} exact/>
             <Route path="/admin" component={AdminPage} exact/>
           </Switch>
        </div> 
      </BrowserRouter>
    );
  }
}

export default App;
