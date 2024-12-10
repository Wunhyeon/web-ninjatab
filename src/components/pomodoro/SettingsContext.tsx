import React from "react";

// const SettingsContext = React.createContext({
//   workMinutes: 45,
//   breakMinutes: 10,
//   setWorkMinutes: React.Dispatch<React.SetStateAction<number>>,

// });

interface SettingsContextType {
  workMinutes: number;
  breakMinutes: number;
  setWorkMinutes: React.Dispatch<React.SetStateAction<number>>;
  setBreakMinutes: React.Dispatch<React.SetStateAction<number>>;
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsContext = React.createContext<SettingsContextType>({
  workMinutes: 45,
  breakMinutes: 10,
  setWorkMinutes: () => {}, // 기본값으로 더미 함수 할당
  setBreakMinutes: () => {}, // 기본값으로 더미 함수 할당
  showSettings: false,
  setShowSettings: () => {},
});

export default SettingsContext;
