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

    // Helper function to get saved slide name map from localStorage
    const getSavedSlideNameMap = (moduleId, chapterId) => {
      try {
        const nameMapKey = `slide-name-map-${moduleId}-${chapterId}`;
        const savedNameMap = localStorage.getItem(nameMapKey);

        console.log(`Looking for slide name map with key: ${nameMapKey}`);
        console.log(`Found in localStorage:`, savedNameMap);

        if (savedNameMap) {
          const nameMap = JSON.parse(savedNameMap);
          console.log("Parsed saved slide name map:", nameMap);
          return nameMap;
        }
      } catch (e) {
        console.error("Error loading saved slide name map:", e);
      }
      console.log("No saved slide name map found");
      return null;
    };

    // Helper function to get saved slide id order from localStorage
    const getSavedSlideIdOrder = (moduleId, chapterId) => {
      try {
        const idKey = `slide-id-order-${moduleId}-${chapterId}`;
        const saved = localStorage.getItem(idKey);
        console.log(`Looking for slide id order with key: ${idKey}`);
        console.log(`Found in localStorage:`, saved);
        if (saved) {
          const ids = JSON.parse(saved);
          console.log("Parsed saved slide id order:", ids);
          return ids;
        }
      } catch (e) {
        console.error("Error loading saved slide id order:", e);
      }
      console.log("No saved slide id order found");
      return null;
    };

    // Helper function to reorder pages based on slide order (names)
    const reorderPagesBySlideOrder = (pages, slideOrder) => {
      try {
        console.log("=== REORDERING PAGES ===");
        console.log("Original pages count:", pages.length);
        console.log("Slide order:", slideOrder);

        // Create a mapping of slide names to pages using the original sequential names
        const slideNameToPage = {};
        pages.forEach((page, index) => {
          const slideName = `Slide ${index + 1}`;
          slideNameToPage[slideName] = page;
        });

        console.log(
          "Slide name to page mapping:",
          Object.keys(slideNameToPage)
        );

        // Reorder pages based on the slide order
        const reorderedPages = slideOrder
          .map((slideName) => {
            const page = slideNameToPage[slideName];
            console.log(
              `Mapping "${slideName}" to page:`,
              page ? page.id : "NOT FOUND"
            );
            return page;
          })
          .filter(Boolean);

        console.log("Reordered pages count:", reorderedPages.length);
        console.log(
          "Reordered page IDs:",
          reorderedPages.map((p) => p.id)
        );
        console.log("=== END REORDERING ===");
        return reorderedPages;
      } catch (e) {
        console.error("Error reordering pages:", e);
        return pages;
      }
    };

    // Helper function to reorder pages based on saved id order (preferred)
    const reorderPagesByIdOrder = (pages, idOrder) => {
      try {
        const idToPage = {};
        pages.forEach((page) => (idToPage[page.id] = page));
        const reordered = idOrder.map((id) => idToPage[id]).filter(Boolean);
        return reordered.length ? reordered : pages;
      } catch (e) {
        console.error("Error reordering pages by id:", e);
        return pages;
      }
    };

    // Helper function to add narration and order properties to pages
    const addNarrationAndOrder = (pages, nameMap = null) => {
      console.log("=== addNarrationAndOrder DEBUG ===");
      console.log("pages length:", pages?.length);
      console.log("nameMap parameter:", nameMap);
      console.log("nameMap type:", typeof nameMap);
      console.log("nameMap is object:", nameMap && typeof nameMap === "object");
      console.log("=== END DEBUG ===");

      return (
        pages?.map((page, pageIndex) => {
          // Use the slide name from the name map if available, otherwise use sequential naming
          const slideName =
            (nameMap && page.id && nameMap[page.id]) ||
            `Slide ${pageIndex + 1}`;
          console.log(
            `Page ${pageIndex} (ID: ${
              page.id
            }): slideName = "${slideName}" (from nameMap[${page.id}]: ${
              nameMap?.[page.id]
            })`
          );

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

    // Debug: Log the current store state
    console.log("=== STORE STATE DEBUG ===");
    console.log("Store pages:", store.pages);
    console.log("Store pages length:", store.pages?.length);
    console.log("Active module ID:", activeModuleId);
    console.log("Active chapter ID:", activeChapterId);
    console.log("=== END STORE STATE DEBUG ===");

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

          // Check if there's a saved slide order for this chapter
          console.log(`=== PROCESSING CHAPTER ${module.id}-${chapter.id} ===`);
          console.log("Chapter pages count:", chapterPages.length);

          const savedIdOrder = getSavedSlideIdOrder(module.id, chapter.id);
          const savedNameMap = getSavedSlideNameMap(module.id, chapter.id);

          let finalPages = chapterPages;
          let nameMapForNames = null;

          if (savedIdOrder && savedIdOrder.length === chapterPages.length) {
            console.log("✅ Applying saved ID slide order to chapter pages");
            finalPages = reorderPagesByIdOrder(chapterPages, savedIdOrder);
            // Use the saved name map for slide names
            nameMapForNames = savedNameMap;
          } else {
            console.log("❌ No saved ID order or length mismatch");

            // Fallback for the ACTIVE chapter: read current order from UI/store
            if (
              module.id === activeModuleId &&
              chapter.id === activeChapterId
            ) {
              try {
                console.log(
                  "⚠️ Falling back to current UI/store order for active chapter"
                );
                // 1) Try ID order from store (most reliable)
                const currentStoreIdOrder = (store.pages || []).map(
                  (p) => p.id
                );
                if (currentStoreIdOrder.length === chapterPages.length) {
                  finalPages = reorderPagesByIdOrder(
                    chapterPages,
                    currentStoreIdOrder
                  );
                }

                // 2) Use the current name map for slide names
                nameMapForNames = savedNameMap;
              } catch (e) {
                console.error("Fallback order derivation failed:", e);
              }
            }
          }

          console.log(
            `DEBUG: Chapter ${chapter.id} - Calling addNarrationAndOrder with finalPages length: ${finalPages.length} and nameMapForNames:`,
            nameMapForNames
          );
          return {
            id: chapter.id,
            chapterName: chapter.name,
            isExpanded: chapter.isExpanded,
            pages: addNarrationAndOrder(finalPages, nameMapForNames),
          };
        });
      } else {
        // If no chapters, include pages directly under module
        const moduleKey = `module-${module.id}`;
        const modulePages = chapterPagesRef.current[moduleKey] || [];

        // Check if there's a saved slide order for this module (when no chapters)
        const savedIdOrder = getSavedSlideIdOrder(module.id, "default");
        const savedNameMap = getSavedSlideNameMap(module.id, "default");

        let finalPages = modulePages;
        let nameMapForNames = null;

        if (savedIdOrder && savedIdOrder.length === modulePages.length) {
          finalPages = reorderPagesByIdOrder(modulePages, savedIdOrder);
          nameMapForNames = savedNameMap;
        }

        moduleData.pages = addNarrationAndOrder(finalPages, nameMapForNames);
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
