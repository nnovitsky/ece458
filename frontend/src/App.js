import './App.css';

import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import LoginPage from './components/login/LoginPage';
import AdminPage from './components/admin/AdminPage';
import UserProfilePage from './components/user/UserProfilePage';
import ImportPage from './components/import/ImportPage';
import ModelTablePage from './components/model/ModelTablePage';
import ModelDetailPage from './components/model/ModelDetailView';
import InstrumentTablePage from './components/instrument/InstrumentTablePage';
import InstrumentDetailView from './components/instrument/InstrumentDetailView';
import Navigation from './components/Navigation';

class App extends Component {
  render() {
    return (      
       <BrowserRouter>
        <div>
          <Navigation />
            <Switch>
             <Route path="/" component={LoginPage} exact/>
            <Route path="/models" component={ModelTablePage} exact />
            <Route path="/models/:pk" component={ModelDetailPage} exact />
            <Route path="/instruments" component={InstrumentTablePage} exact />
            <Route path="/instruments/:pk" component={InstrumentDetailView} exact />
            <Route path="/import" component={ImportPage} exact/>
             <Route path="/user-profile" component={UserProfilePage} exact/>
             <Route path="/admin" component={AdminPage} exact/>
           </Switch>
        </div> 
      </BrowserRouter>
    );
  }
}

export default App;
