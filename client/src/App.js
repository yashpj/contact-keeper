import React , { Fragment } from 'react';
import {BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import './App.css';
import  Register from './components/auth/Register';
import  Login  from './components/auth/Login';

const App = () => (
  <Route>
    <Fragment>
      <Navbar/>
      <Route exact path="/" component={Landing} />
      <section className="container">
        <Switch>
          <Route exact path="/Register" component={Register} />
          <Route exact path="/Login" component={Login} />
        </Switch>
      </section>
    </Fragment>
  </Route>
);

export default App;
