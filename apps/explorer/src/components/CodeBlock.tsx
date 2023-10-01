import styled from "styled-components";

export const CodeBlock = styled.pre`
  user-select: all;
  font-size: 12px;
  background-color: var(--accent-a3);
  color: var(--accent-a11);
  border-radius: var(--radius-4);
  /* padding: var(--space-3); */
  font-family: monospace;
  overflow: scroll;
  word-break: break-all;
  width: 100%;
  &:hover {
    color: var(--accent-a12);
  }
`
