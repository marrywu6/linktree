interface ImportNode {
  type: 'folder' | 'link';
  title: string;
  addDate: number;
  url?: string;
  icon?: string;
  children?: ImportNode[];
}

interface ProcessedBookmark {
  title: string;
  url: string;
  icon?: string;
  addDate: string;
  folderId?: string;
}

interface ProcessedFolder {
  name: string;
  addDate: string;
  icon?: string;
  parentId?: string | null;
}

interface LinktreeFolder {
  name: string;
  icon: string;
  addDate: string;
  parentId: string | null;
}

interface LinktreeBookmark {
  title: string;
  url: string;
  icon?: string;
  addDate: string;
  folderId?: string | null;
}

interface LinktreeImport {
  name: string;
  folders: LinktreeFolder[];
  bookmarks: LinktreeBookmark[];
}

export async function processImportData(jsonData: ImportNode[] | LinktreeImport) {
  const folders: ProcessedFolder[] = [];
  const bookmarks: ProcessedBookmark[] = [];
  const processedFolderNames = new Set<string>();

  const processTimestamp = (timestamp: number): string => {
    try {
      if (!timestamp || timestamp < 0) {
        return new Date().toISOString();
      }
      
      const date = timestamp.toString().length <= 10 
        ? new Date(timestamp * 1000) 
        : new Date(timestamp);
        
      if (isNaN(date.getTime())) {
        return new Date().toISOString();
      }
      
      return date.toISOString();
    } catch (error) {
      console.error('Error processing timestamp:', error);
      return new Date().toISOString();
    }
  };

  if ('folders' in jsonData) {
    const linktreeData = jsonData as LinktreeImport;
    
    linktreeData.folders.forEach(folder => {
      if (!processedFolderNames.has(folder.name)) {
        const processedFolder: ProcessedFolder = {
          name: folder.name,
          icon: folder.icon || "",
          addDate: folder.addDate,
          parentId: folder.parentId
        };
        folders.push(processedFolder);
        processedFolderNames.add(folder.name);
      }
    });

    if (linktreeData.bookmarks && Array.isArray(linktreeData.bookmarks)) {
      linktreeData.bookmarks.forEach(bookmark => {
        const processedBookmark: ProcessedBookmark = {
          title: bookmark.title,
          url: bookmark.url,
          icon: bookmark.icon || "",
          addDate: bookmark.addDate,
          folderId: bookmark.folderId || undefined
        };
        bookmarks.push(processedBookmark);
      });
    }
  } else {
    function processNode(node: ImportNode, parentFolderId?: string) {
      if (node.type === 'folder') {
        if (!processedFolderNames.has(node.title)) {
          const folder: ProcessedFolder = {
            name: node.title,
            addDate: processTimestamp(node.addDate),
            icon: node.icon,
            parentId: parentFolderId
          };
          folders.push(folder);
          processedFolderNames.add(node.title);
        }

        if (node.children) {
          node.children.forEach(child => processNode(child, node.title));
        }
      } else if (node.type === 'link') {
        const bookmark: ProcessedBookmark = {
          title: node.title,
          url: node.url!,
          icon: node.icon,
          addDate: processTimestamp(node.addDate),
          folderId: parentFolderId
        };
        bookmarks.push(bookmark);
      }
    }

    const firstLevelChildren = (jsonData as ImportNode[])[0]?.children || [];
    firstLevelChildren.forEach(node => processNode(node));
  }

  return {
    folders,
    bookmarks
  };
}
