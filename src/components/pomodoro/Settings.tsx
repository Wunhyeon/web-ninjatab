import React, { useContext } from "react";
import { cn } from "@/lib/utils";
import SettingsContext from "./SettingsContext";
import { BackButton } from "./BackButton";
import { SettingSlider } from "../ui/setting-slider";

const Settings = () => {
  // const context =  useContext(SettingsContext);
  const settingsInfo = useContext(SettingsContext);

  return (
    <div className="text-left mx-auto px-3 h-3/4">
      <label className="block mb-2 text-slate-300 capitalize">
        Work Minutes :{settingsInfo.workMinutes}
      </label>
      <SettingSlider
        lineColor="border-red-500"
        thumbColor="bg-red-500"
        defaultValue={[settingsInfo.workMinutes]}
        max={100}
        step={1}
        className={cn()}
        //   {...props}
        onValueChange={(newValue) => settingsInfo.setWorkMinutes(newValue[0])}
      />
      <label className="block mb-2 text-slate-300 capitalize">
        Break Minutes :{settingsInfo.breakMinutes}
      </label>
      <SettingSlider
        lineColor="border-green-500"
        thumbColor="bg-green-500"
        defaultValue={[settingsInfo.breakMinutes]}
        max={100}
        step={1}
        className={cn()}
        onValueChange={(newValue) => settingsInfo.setBreakMinutes(newValue[0])}
      />
      <div className="text-center mt-5">
        <BackButton />
      </div>
    </div>
  );
};

export default Settings;
