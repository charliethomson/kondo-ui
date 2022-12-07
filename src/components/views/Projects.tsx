import { FC } from "react";
import { Project } from "../../components/atoms/Project";
import styled from "@emotion/styled";
import { FaChevronLeft, FaFolderPlus } from "react-icons/fa";
import { Paper } from "../atoms/Paper";
import { Button } from "../atoms/Button";
import { prettySize } from "../../util/prettySize";
import { BeatLoader } from "react-spinners";
import { useAppDispatch, useAppSelector } from "../../stores";
import { isPending } from "../../util/loading";
import { addSearchPath, clean, reset } from "../../stores/project.slice";

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
  const dispatch = useAppDispatch();
  const { projects, searchPaths, cleanedSpace } = useAppSelector((state) => ({
    projects: state.projects.projects,
    searchPaths: state.projects.searchPaths,
    cleanedSpace: state.projects.cleanedSpace,
  }));

  if (projects.status !== "fulfilled") return null;

  const totalSpace = projects.data
    .map((project) => project.size.artifactSize)
    .reduce((a, b) => a + b, 0);

  const selectedSize = projects.data
    .filter((p) => p.selected)
    .map((project) => project.size.artifactSize)
    .reduce((a, b) => a + b, 0);

  const cleanSelected = () => {
    const identities = projects.data
      .filter((project) => project.selected)
      .map((project) => project.identity);
    dispatch(clean(identities));
  };
  const cleanAll = () => {
    const identities = projects.data.map((project) => project.identity);
    dispatch(clean(identities));
  };

  return (
    <Container>
      <HeaderContainer>
        <HeaderSection>
          <IconButton
            type="FaChevronLeft"
            onClick={() => {
              dispatch(reset());
            }}
          />
          {searchPaths
            .slice(0, 3)
            .map((path) =>
              path.status === "fulfilled" ? (
                <Text key={path.data}>{path.data}</Text>
              ) : (
                <BeatLoader />
              )
            )}{" "}
          {searchPaths.length > 3 ? (
            <Text>+{searchPaths.length - 3}</Text>
          ) : null}
        </HeaderSection>
        <HeaderSection>
          {searchPaths.some((path) => isPending(path)) ? (
            <BeatLoader color="#fff80" />
          ) : (
            <IconButton
              type="FaFolderPlus"
              onClick={() => {
                dispatch(addSearchPath());
              }}
            />
          )}
        </HeaderSection>
        <HeaderSeparator />
        <HeaderSection>
          <Button onClick={cleanSelected}>
            Clean Selected{" "}
            {selectedSize !== 0 ? (
              <span>({prettySize(selectedSize)})</span>
            ) : null}
          </Button>
          <Button onClick={cleanAll}>Clean All</Button>
        </HeaderSection>
      </HeaderContainer>
      <ContentContainer>
        {[...projects.data]
          .sort((a, b) => b.size.artifactSize - a.size.artifactSize)
          .map((project) => (
            <Project key={project.identity} project={project} />
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
