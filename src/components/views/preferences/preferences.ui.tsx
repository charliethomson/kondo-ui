import styled from "@emotion/styled";
import React, { FC } from "react";
import { useAppSelector } from "../../../stores";
import { PreferencesState } from "../../../stores/preferences.slice";

const PreferencesContainer = styled.div``;
const Column = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: flex-start;
  align-items: left;
  margin: 0;
  padding: 0;
  > li {
    color: white;
    list-style: none;
  }
`;

type Toggle = {
  key: keyof PreferencesState["config"];
  label: string;
  checked?: boolean;
};

export const UIPreferences: FC = () => {
  const { enableGlass } = useAppSelector((state) => ({
    enableGlass: state.preferences.config.enableGlass,
  }));

  const toggles: Toggle[] = [
    { key: "enableGlass", label: "Enable transparency", checked: enableGlass },
  ];

  const setDraft = (part: Partial<PreferencesState>) => {};

  return (
    <PreferencesContainer>
      <Column>
        {toggles.map(({ key, label, checked }) => (
          <li key={key}>
            <label htmlFor={key}>{label}</label>
            <input
              type="checkbox"
              id={key}
              checked={checked ?? false}
              onChange={(ev) =>
                setDraft({
                  [key as unknown as symbol]: ev.target.value,
                })
              }
            />
          </li>
        ))}
      </Column>
    </PreferencesContainer>
  );
};
