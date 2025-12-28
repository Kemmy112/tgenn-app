import React from 'react';
import './styles/app.css';
import './styles/index.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import HomePage from './pages/home';
import Signup from './auth/signup';
import Signin from './auth/signin';
import Layout from './components/layout';
import Onboarding from './pages/onboardingpage';
import Dashboard from './pages/dashboard';
import Performance from './pages/performance';
import AcademicLoad from './pages/academicload';
import ForgotPassword from './pages/forgotpswd';
import ResetPassword from './pages/resetpswd';
import VerifyEmail from './auth/verifyemail';

function App() {
  return (
  <Router>
     <Routes>
      <Route path = "/" element = {<HomePage/>}/>
      <Route path = "/signup" element = {<Signup/>}/>
      <Route path = "/signin" element = {<Signin/>}/>
      <Route path = "/onboardingpage" element = {<Onboarding/>}/>
      <Route element = {<Layout />}>
      <Route path = "/dashboard" element = {<Dashboard/>}/>
      <Route path = "/academicload" element = {<AcademicLoad/>}/>
      <Route path = "/performance" element = {<Performance/>}/>
      </Route>
      <Route path = "/forgotpswd" element = {<ForgotPassword/>}/>
      <Route path = "/resetpswd" element = {<ResetPassword/>}/>
      <Route path = "/verifyemail" element = {<VerifyEmail/>}/>
     </Routes>
  </Router>
  )
};

export default App;
