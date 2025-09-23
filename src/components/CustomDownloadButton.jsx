import { Button, Menu, MenuItem, Popover, Position } from "@blueprintjs/core";
import { Download } from "@blueprintjs/icons";
import { saveAs } from "file-saver";

const CustomDownloadButton = ({
  store,
  modules,
  chapterPagesRef,
  activeModuleId,
  activeChapterId,
}) => {
  const handleSaveAsImage = () => {
    try {
      console.log("Attempting to download as PNG...");
      store.saveAsImage();
    } catch (error) {
      console.error("Error downloading PNG:", error);
    }
  };

  const handleSaveAsPDF = () => {
    try {
      console.log("Attempting to download as PDF...");
      store.saveAsPDF();
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const handleSaveAsJSON = () => {
    // Helper function to get chapter key
    const getChapterKey = (moduleId, chapterId) => `${moduleId}-${chapterId}`;

    // Helper function to add narration and order properties to pages
    const addNarrationAndOrder = (pages) => {
      return (
        pages?.map((page, pageIndex) => {
          // Always generate sequential slide names (Slide 1, Slide 2, Slide 3, etc.)
          const slideName = `Slide ${pageIndex + 1}`;
          console.log(`Page ${pageIndex}: slideName = "${slideName}"`);

          console.log(`Original page object:`, page);
          console.log(`Original page name:`, page.name);
          console.log(`Adding slideName: "${slideName}" to page`);

          // Create a new page object with explicit slideName property
          const updatedPage = {
            ...page,
            slideName: slideName, // Explicitly set the slideName property
          };

          console.log(`Updated page object:`, updatedPage);
          console.log(`Updated page slideName:`, updatedPage.slideName);

          const finalPage = {
            ...updatedPage,
            slideName: slideName, // Ensure slideName is explicitly set in final object
            children:
              page.children
                ?.slice()
                .reverse()
                .map((child, index) => {
                  // For narration, use the element ID with # prefix if no name/text/title
                  const narration =
                    child.name || child.text || child.title || `#${child.id}`;
                  console.log(
                    `Child ${index}: name="${child.name}", text="${child.text}", title="${child.title}", narration="${narration}"`
                  );

                  // Remove the original 'name' property and create new object without it
                  const { name, ...childWithoutName } = child;

                  return {
                    ...childWithoutName,
                    narration: narration,
                    order: index + 1, // First element in layers gets order 1
                  };
                }) || [],
          };

          console.log(`Final page object slideName:`, finalPage.slideName);
          return finalPage;
        }) || []
      );
    };

    // Create the module structure
    const moduleStructure = modules.map((module) => {
      const moduleData = {
        id: module.id,
        moduleName: module.name,
        isExpanded: module.isExpanded,
      };

      // If module has chapters, include them
      if (module.chapters && module.chapters.length > 0) {
        moduleData.chapters = module.chapters.map((chapter) => {
          const chapterKey = getChapterKey(module.id, chapter.id);
          const chapterPages = chapterPagesRef.current[chapterKey] || [];

          return {
            id: chapter.id,
            chapterName: chapter.name,
            isExpanded: chapter.isExpanded,
            pages: addNarrationAndOrder(chapterPages),
          };
        });
      } else {
        // If no chapters, include pages directly under module
        const moduleKey = `module-${module.id}`;
        const modulePages = chapterPagesRef.current[moduleKey] || [];
        moduleData.pages = addNarrationAndOrder(modulePages);
      }

      return moduleData;
    });

    const blob = new Blob([JSON.stringify(moduleStructure, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "module-structure.json");
  };

  const downloadMenu = (
    <Menu>
      <MenuItem icon="media" text="Save as image" onClick={handleSaveAsImage} />
      <MenuItem icon="document" text="Save as PDF" onClick={handleSaveAsPDF} />
      <MenuItem icon="code" text="Save as JSON" onClick={handleSaveAsJSON} />
    </Menu>
  );

  return (
    <Popover content={downloadMenu} position={Position.BOTTOM_LEFT}>
      <Button
        icon={<Download />}
        text="Download"
        endIcon="caret-down"
        style={{ marginLeft: "12px" }}
      />
    </Popover>
  );
};

export default CustomDownloadButton;
