import React from "react";
import Login from "../Login";
import Dashboard from "../Dashboard";

export default {
    '/': () => <Login/>,
    '/dashboard': () => <Dashboard/>,
};
