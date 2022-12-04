import styled from "@emotion/styled";
import { appWindow, LogicalSize } from "@tauri-apps/api/window";
import { useEffect } from "react";
import { PropagateLoader } from "react-spinners";
import finderUrl from "../../assets/images/finder.png";
import { useProjectStore } from "../../stores/project.store";

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
  const fetchProjects = useProjectStore((store) => store.fetch);
  const status = useProjectStore((store) => store.status);

  useEffect(() => {
    appWindow.setSize(new LogicalSize(280, 180));

    return () => {
      appWindow.setSize(new LogicalSize(1280, 720));
    };
  }, []);

  useEffect(() => console.log(status), [status]);

  const disabled = status !== "idle" && status !== "rejected";

  const handleClick = () => {
    if (disabled) return;
    fetchProjects!();
  };

  return (
    <Container onClick={handleClick} disabled={disabled}>
      {status === "pending" ? (
        <PropagateLoader color="#fff" />
      ) : (
        <img src={finderUrl} alt="Select a file." />
      )}
    </Container>
  );
};
