import { FC } from "react";
import { getProjectSize, useProjectStore } from "../../stores/project.store";
import { Project } from "../../components/atoms/Project";
import styled from "@emotion/styled";
import { FaChevronLeft, FaFolderPlus } from "react-icons/fa";
import { Paper } from "../atoms/Paper";
import { Button } from "../atoms/Button";
import { prettySize } from "../../util/prettySize";
import { BeatLoader } from "react-spinners";

const CONTAINER_PADDING = "2rem";
const HEADER_FOOTER_HEIGHT = "3rem";
const CONTENT_PADDING = "1rem";

const Container = styled.div`
  --padding: ${CONTAINER_PADDING};
  width: calc(100vw - calc(2 * var(--padding)));
  height: calc(100vh - calc(2 * var(--padding)));
  overflow: hidden;
  padding: var(--padding);
`;

const HeaderContainer = styled.div`
  width: 100%;
  height: ${HEADER_FOOTER_HEIGHT};
  display: flex;
  gap: 32px;
`;
const HeaderSeparator = styled.div`
  flex: 1;
`;

const HeaderSection = styled(Paper)`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
const ContentContainer = styled.section`
  --container-padding: ${CONTAINER_PADDING};
  --header-footer-height: ${HEADER_FOOTER_HEIGHT};
  --padding: ${CONTENT_PADDING};

  --space-consumed-by-header-footer: calc(2 * var(--header-footer-height));
  --space-consumed-by-container-padding: calc(2 * var(--container-padding));
  --space-consumed-by-content-padding: calc(2 * var(--padding));
  --space-consumed-by-padding: calc(
    var(--space-consumed-by-content-padding) +
      var(--space-consumed-by-container-padding)
  );
  --total-space-consumed: calc(
    var(--space-consumed-by-header-footer) + var(--space-consumed-by-padding)
  );

  --width: calc(100% - var(--space-consumed-by-content-padding));

  width: var(--width);
  height: calc(100vh - var(--total-space-consumed));

  margin: var(--padding);

  overflow-y: auto;

  --project-width: 200px;

  display: flex;
  flex-wrap: wrap;

  gap: 1rem;
`;
const FooterContainer = styled(Paper)``;

const Text = styled.p`
  font-family: "SF Pro", arial;
  font-size: 16px;
  color: white;
  padding: 0;
  margin: 0;
`;

interface IconButtonProps {
  type: string;
  onClick: () => void;
}
const IconButton: FC<IconButtonProps> = ({ type, onClick }) => {
  const Icon = {
    FaChevronLeft: FaChevronLeft,
    FaFolderPlus: FaFolderPlus,
  }[type];

  if (!Icon) return null;
  return <Icon fill="white" onClick={onClick} style={{ cursor: "pointer" }} />;
};

export const Projects: FC = () => {
  const { projects, searchPaths, cleanedSpace, addStatus } = useProjectStore(
    (state) => ({
      projects: state.projects,
      searchPaths: state.searchPaths,
      cleanedSpace: state.cleanedSpace,
      addStatus: state.addStatus,
    })
  );

  const addFolder = useProjectStore((store) => store.addDirectory!);
  const resetStore = useProjectStore((store) => store.reset!);
  const cleanSelected = useProjectStore((store) => store.cleanSelected!);
  const cleanAll = useProjectStore((store) => store.cleanAll!);

  const totalSpace = projects
    .map((project) => project.size.artifactSize)
    .reduce((a, b) => a + b, 0);

  const selectedSize = projects
    .filter((p) => p.selected)
    .map((project) => project.size.artifactSize)
    .reduce((a, b) => a + b, 0);

  return (
    <Container>
      <HeaderContainer>
        <HeaderSection>
          <IconButton
            type="FaChevronLeft"
            onClick={() => {
              resetStore!();
            }}
          />
          {searchPaths.slice(0, 3).map((path) => (
            <Text>{path}</Text>
          ))}{" "}
          {searchPaths.length > 3 ? (
            <Text>+{searchPaths.length - 3}</Text>
          ) : null}
        </HeaderSection>
        <HeaderSection>
          {addStatus === "pending" ? (
            <BeatLoader color="#fff80" />
          ) : (
            <IconButton
              type="FaFolderPlus"
              onClick={() => {
                addFolder();
              }}
            />
          )}
        </HeaderSection>
        <HeaderSeparator />
        <HeaderSection>
          <Button onClick={() => cleanSelected()}>
            Clean Selected{" "}
            {selectedSize !== 0 ? (
              <span>({prettySize(selectedSize)})</span>
            ) : null}
          </Button>
          <Button onClick={() => cleanAll()}>Clean All</Button>
        </HeaderSection>
      </HeaderContainer>
      <ContentContainer>
        {projects
          .sort((a, b) => getProjectSize(b) - getProjectSize(a))
          .map((project) => (
            <Project key={project.path} project={project} />
          ))}
      </ContentContainer>
      {totalSpace !== 0 ? (
        <FooterContainer>
          <Text>
            Cleaned {prettySize(cleanedSpace)} / {prettySize(totalSpace)}
          </Text>
        </FooterContainer>
      ) : null}
    </Container>
  );
};
