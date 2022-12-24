import styled from "@emotion/styled";
import { appWindow, LogicalSize } from "@tauri-apps/api/window";
import { useEffect } from "react";
import { PropagateLoader } from "react-spinners";
import finderUrl from "../../assets/images/finder.png";
import { useAppDispatch, useAppSelector } from "../../stores";
import { fetchProjects } from "../../stores/project.slice";

const Container = styled.div<{ disabled?: boolean }>`
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;
  ${({ disabled }) => (disabled ? "" : "cursor: pointer;")};
`;

export const Index = () => {
  const dispatch = useAppDispatch();

  const status = useAppSelector((state) => state.projects.projects.status);

  useEffect(() => {
    appWindow.setSize(new LogicalSize(280, 180));

    return () => {
      appWindow.setSize(new LogicalSize(1280, 720));
    };
  }, []);

  const disabled = status !== "idle" && status !== "rejected";

  const handleClick = () => {
    if (disabled) return;
    dispatch(fetchProjects());
  };
  return (
    <Container onClick={handleClick} disabled={disabled} title={status}>
      {status === "pending" ? (
        <PropagateLoader color="#fff" />
      ) : (
        <img src={finderUrl} alt="Select a file." />
      )}
    </Container>
  );
};
