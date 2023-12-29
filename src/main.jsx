import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
// import { loadUser, logoutUser,  } from './redux/Slices/authSlice.js';
// import { userDetails } from './redux/Slices/userSlice.js';

// store.dispatch(loadUser());
// store.dispatch(logoutUser());

import { BrowserAgent } from '@newrelic/browser-agent/loaders/browser-agent'

// Populate using values in copy-paste JavaScript snippet.

const nr_cart_ip = import.meta.env.VITE_NR_CART_IP;
const nr_prod_ip = import.meta.env.VITE_NR_PROD_IP;
const nr_order_ip = import.meta.env.VITE_NR_ORDER_IP;
const nr_users_ip = import.meta.env.VITE_NR_USERS_IP;

const options = {
  init: { distributed_tracing:{enabled:true,cors_use_newrelic_header:true,cors_use_tracecontext_headers:true,allowed_origins:[ nr_cart_ip, nr_order_ip, nr_prod_ip, nr_users_ip ]},privacy:{cookies_enabled:true},ajax:{deny_list:["bam.nr-data.net"]} }, // NREUM.init
  info: { beacon:"bam.nr-data.net",errorBeacon:"bam.nr-data.net",licenseKey:"NRJS-ffbec38761b38989cb3",applicationID:"1134406453",sa:1 }, // NREUM.info
  loader_config: { accountID:"3884245",trustKey:"3692228",agentID:"1134406453",licenseKey:"NRJS-ffbec38761b38989cb3",applicationID:"1134406453" } // NREUM.loader_config
}

// The agent loader code executes immediately on instantiation.
new BrowserAgent(options)


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
