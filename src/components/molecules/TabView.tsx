import styled from "@emotion/styled";
import React, { FC, ReactNode, useState } from "react";

interface TabHeader {
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

export interface TabViewProps<Views extends Record<string, TabHeader>> {
  options: Views;
  currentView?: keyof Views;
}

const TabViewContainer = styled.div``;
const TabsContainer = styled.div`
  border-bottom: 1px solid #666;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
`;
const TabItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin: 0.5rem 0.25rem;
  min-width: 40px;
  cursor: pointer;
  border-radius: 8px;
  > span {
    color: white;
    font-weight: 500;
  }
  transition: background 0.25s ease;

  background: #88888840;
  &:hover {
    background: #88888880;
  }
  &.active {
    background: #888888;
  }
`;
const ContentContainer = styled.div`
  padding: 1rem;
`;

export function TabView<T extends Record<string, TabHeader>>({
  options,
  currentView,
}: TabViewProps<T>) {
  const [activeView, setActiveView] = useState<keyof T | undefined>(
    currentView
  );

  return (
    <TabViewContainer>
      <TabsContainer>
        {Object.entries(options).map(([key, { label, icon: Icon }]) => (
          <TabItem
            key={key}
            className={activeView === key ? "active" : ""}
            onClick={() => setActiveView(key)}
          >
            {Icon}
            <span>{label}</span>
          </TabItem>
        ))}
      </TabsContainer>

      <ContentContainer>
        {activeView ? options[activeView].content : null}
      </ContentContainer>
    </TabViewContainer>
  );
}
