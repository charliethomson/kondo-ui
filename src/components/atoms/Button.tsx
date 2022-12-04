import styled from "@emotion/styled";
interface ButtonProps {
  disabled?: boolean;
}
export const Button = styled.p<ButtonProps>`
  ${({ disabled }) =>
    disabled
      ? `
        background: #666;
`
      : `
      background: #b4b4b4;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      cursor: pointer;
 
 `};

  padding: 0.25rem 0.5rem;
  margin: 0;
  min-height: fit-content;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;

  font-family: "SF Pro";
`;
