import "@/App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import Dashboard from "@/pages/Dashboard";
import Receipts from "@/pages/Receipts";
import Products from "@/pages/Products";
import Savings from "@/pages/Savings";
import DataControls from "@/pages/DataControls";
import { DataProvider, useData } from "@/state/DataContext";

function Shell() {
    const { bump } = useData();
    return (
        <div className="App min-h-screen bg-paper">
            <Header onImported={bump} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/receipts" element={<Receipts />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/savings" element={<Savings />} />
                    <Route path="/data" element={<DataControls />} />
                </Routes>
            </main>
            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <p className="text-xs text-stone-500 font-mono">
                    kassabon · client-side · your data never leaves this browser
                </p>
            </footer>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#FFFDF9",
                        border: "1px solid #E7E2D8",
                        color: "#1C1917",
                        fontFamily: "DM Sans, sans-serif",
                    },
                }}
            />
        </div>
    );
}

function App() {
    return (
        <DataProvider>
            <HashRouter>
                <Shell />
            </HashRouter>
        </DataProvider>
    );
}

export default App;
