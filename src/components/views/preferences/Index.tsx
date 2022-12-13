import React, { FC, useEffect } from "react";
import { FaChartLine, FaGlasses } from "react-icons/fa";
import { useAppDispatch } from "../../../stores";
import { fetchPreferences } from "../../../stores/preferences.slice";
import { TabView } from "../../molecules/TabView";
import { UIPreferences } from "./preferences.ui";

export const Preferences: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchPreferences());
  });

  return (
    <TabView
      options={{
        ui: {
          icon: <FaGlasses color="white" />,
          label: "UI",
          content: <UIPreferences />,
        },
      }}
      currentView="ui"
    />
  );
};
