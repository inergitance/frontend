import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppProvider } from "./redux/AppContext";

import PageLayout from "./pages/Layout";

import AboutPage from "./pages/About";
import HomePage from "./pages/Home";
import HowItWorksPage from "./pages/HowItWorks";
import MyInheritancePage from "./pages/MyInheritance";
import CreateInheritancePage from "./pages/CreateInheritance";
import InheritanceOwnerPage from "./pages/InheritancesOwner";
import InheritanceHeirPage from "./pages/InheritanceHeir";

import "./css/App.css";

// todo fix default route to home maybe???

function App() {

    return (
        <AppProvider>
            <BrowserRouter>
                <PageLayout>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/how-it-works" element={<HowItWorksPage />} />
                        <Route path="/my-inheritance" element={<MyInheritancePage />} />
                        <Route path="/create-inheritance" element={<CreateInheritancePage />} />
                        <Route path="/inheritances/owner" element={<InheritanceOwnerPage />} />
                        <Route path="/inheritances/heir" element={<InheritanceHeirPage />} />
                    </Routes>
                </PageLayout>
            </BrowserRouter>
        </AppProvider>
    );

}

export default App;
