import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem("theme");
        return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    });

    useEffect(() => {
        const root = window.document.documentElement;
        console.log("Current isDarkMode state:", isDarkMode); // DEBUG 1

        if (isDarkMode) {
            root.classList.add("dark");
            console.log("Class 'dark' added to HTML tag"); // DEBUG 2
        } else {
            root.classList.remove("dark");
            console.log("Class 'dark' removed from HTML tag"); // DEBUG 3
        }
        console.log('inside context : ',isDarkMode);
        
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);