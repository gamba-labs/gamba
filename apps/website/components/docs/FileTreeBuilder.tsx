import { ReactElement, useEffect, useState } from 'react'

import { FileTree } from './FileTree'
import { Octokit } from '@octokit/rest'

interface GitHubNode {
  type: 'file' | 'dir'
  name: string
  path: string
  children?: GitHubNode[]
}

// List of extensions to allow
const ALLOWED_CODE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx'
]

// Function to determine if a file should be included
function isCodeFile(fileName: string): boolean {
  return ALLOWED_CODE_EXTENSIONS.some(ext => fileName.endsWith(ext))
}

// Utility function to build the file tree recursively
function buildFileTree(nodes: GitHubNode[]): ReactElement[] {
  return nodes.map((node) => {
    if (node.type === 'dir') {
      return (
        <FileTree.Folder key={node.path} name={node.name}>
          {buildFileTree(node.children || [])}
        </FileTree.Folder>
      )
    }

    if (isCodeFile(node.name)) {
      return <FileTree.File key={node.path} name={node.name} />
    }

    // Skip any non-code files
    return null
  }).filter(Boolean) // Filter out nulls
}

interface GitHubFileTreeProps {
  owner: string
  repo: string
  branch?: string
  path?: string
}

const GitHubFileTree = ({ owner, repo, branch = 'main', path = '' }: GitHubFileTreeProps): ReactElement => {
  const [fileTree, setFileTree] = useState<ReactElement[] | null>(null)

  useEffect(() => {
    // Initialize Octokit without authentication
    const octokit = new Octokit()

    // Fetch directory content recursively, filtering non-code files
    async function fetchRepoContent(path: string): Promise<GitHubNode[]> {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        ref: branch,
        path,
      })

      if (Array.isArray(data)) {
        const filesAndFolders = await Promise.all(
          data.map(async (node) => {
            if (node.type === 'dir') {
              const children = await fetchRepoContent(node.path)
              return { ...node, children }
            }

            // Only return this file if it's a code file
            if (isCodeFile(node.name)) {
              return node
            }

            // Skip non-code files
            return null
          })
        )

        // Filter out nulls from skipped files
        return filesAndFolders.filter(Boolean) as GitHubNode[]
      }

      // If not an array (a single file is fetched), return an empty array
      return []
    }

    // Load and set the file tree structure
    fetchRepoContent(path).then((rootNodes) => {
      const tree = buildFileTree(rootNodes)
      setFileTree(tree)
    })
  }, [owner, repo, branch, path])

  return <FileTree>{fileTree}</FileTree>
}

export default GitHubFileTree
