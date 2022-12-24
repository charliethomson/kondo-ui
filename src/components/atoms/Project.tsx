import reactUrl from "../../assets/react.svg";
import styled from "@emotion/styled";
import { CSSProperties, FC, ReactNode } from "react";

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
import {
  ProjectType,
  Project as TProject,
  toggleSelected,
  clean,
} from "../../stores/project.slice";
import { useAppDispatch, useAppSelector } from "../../stores";
import { isAny, isFulfilled, isPending } from "../../util/loading";
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

  const dispatch = useAppDispatch();
  const { cleanStatus } = useAppSelector((state) => ({
    cleanStatus: state.projects.cleaned[project.identity],
  }));
  const parts = project.path.split("/");
  const name = parts[parts.length-1];
  const disabled =
    !project.hasArtifacts || isAny(cleanStatus, isFulfilled, isPending);
  const artifactDirs = project.size.dirs.filter((dir) => dir.isArtifact);
  const IconComponent = IconPaths[project.projectType];

  const onCleanClicked = async () => {
    if (disabled) return;
    dispatch(clean([project.identity]));
  };

  const buttonContent = (() => {
    if (isPending(cleanStatus))
      return <BeatLoader color="#00000080" size={"8px"} />;
    if (isFulfilled(cleanStatus)) return cleanStatus.data;
    if (!project.hasArtifacts) return "No artifacts";

    return `Clean up (${prettySize(project.size.artifactSize)})`;
  })();

  return (
    <ProjectContainer
      onClick={() => {
        !disabled && dispatch(toggleSelected(project.identity));
      }}
      selected={project.selected}
    >
      <ProjectHeader>
        <Name title={name}>{name}</Name>
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
          onClick={(ev) => {
            ev.stopPropagation();
            onCleanClicked();
          }}
        >
          {buttonContent}
        </Button>
      </ControlsContainer>
    </ProjectContainer>
  );
};
