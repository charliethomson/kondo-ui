import reactUrl from "../../assets/react.svg";
import styled from "@emotion/styled";
import { CSSProperties, FC, ReactNode } from "react";

import {
  Project as TProject,
  ProjectType,
  useProjectStore,
} from "../../stores/project.store";
import { Paper } from "./Paper";
import { Button } from "./Button";
import { BeatLoader } from "react-spinners";

import { Haskell } from "../logos/Haskell";
import { Javascript } from "../logos/Javascript";
import { Java } from "../logos/Java";
import { Rust } from "../logos/Rust";
import { SBT } from "../logos/SBT";
import { Unity } from "../logos/Unity";
import { Unreal } from "../logos/Unreal";
import { prettySize } from "../../util/prettySize";
const IconPaths: Record<ProjectType, () => JSX.Element> = {
  Cargo: Rust,
  Node: Javascript,
  Maven: Java,
  SBT: SBT,
  Stack: Haskell,
  Unity: Unity,
  Unreal: Unreal,
};

const ProjectContainer = styled(Paper)<{ selected: boolean }>`
  ${({ selected }) =>
    selected ? "box-shadow: inset 0 0 15px #ffffff80;" : null}
  padding: 8px;
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
`;
const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0.5rem;
  padding: 0.5rem;
  padding-left: 0;
`;
const Name = styled.h3`
  font-family: "SF Pro";
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  color: #b4b4b4;
  margin: 0;
  margin-right: 1rem;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const IconContainer = styled.div`
  min-width: 32px;
  min-height: 32px;
`;
const ProjectContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;
const ControlsContainer = styled.div`
  display: flex;
  flex-direciton: column;
  justify-content: flex-end;
`;
const ArtifactDirs = styled.div`
  font-family: "SF Pro";
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  color: #b4b4b4;
  > p > span {
    margin-left: 8px;
  }
`;

interface ProjectProps {
  project: TProject;
}

export const Project: FC<ProjectProps> = ({ project }) => {
  const { clean, cleanStatus } = useProjectStore((store) => ({
    clean: store.clean,
    cleanStatus: store.cleanStatus,
  }));

  const toggleSelected = useProjectStore((store) => store.toggleSelected);

  const name = project.path.split("/").at(-1);
  const disabled = !project.hasArtifacts || cleanStatus === "pending";
  const artifactDirs = project.size.dirs.filter((dir) => dir.isArtifact);
  const IconComponent = IconPaths[project.projectType];

  const onCleanClicked = async () => {
    if (disabled) return;
    clean!(project);
  };

  const buttonContent = (() => {
    if (cleanStatus === "pending")
      return <BeatLoader color="#00000080" size={"8px"} />;
    if (!project.hasArtifacts) return "No artifacts";

    return `Clean up (${prettySize(project.size.artifactSize)})`;
  })();

  return (
    <ProjectContainer
      onClick={() => !disabled && toggleSelected!(project)}
      selected={project.selected}
    >
      <ProjectHeader>
        <Name>{name}</Name>
        <IconContainer>
          <IconComponent />
        </IconContainer>
      </ProjectHeader>
      <ProjectContent>
        {project.hasArtifacts ? (
          <>
            <Name style={{ fontSize: "12px" }}>{project.path}</Name>
            <ArtifactDirs>
              {artifactDirs.map((dir) => (
                <p key={dir.fileName}>
                  <span>{dir.fileName}</span>
                  <span>{prettySize(dir.size)}</span>
                </p>
              ))}
            </ArtifactDirs>
          </>
        ) : null}
      </ProjectContent>
      <ControlsContainer>
        <Button
          disabled={disabled}
          style={{ fontSize: "12px" }}
          onClick={onCleanClicked}
        >
          {buttonContent}
        </Button>
      </ControlsContainer>
    </ProjectContainer>
  );
};
