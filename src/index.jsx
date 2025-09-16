import React from "react";
import ReactDOM from "react-dom/client";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { Toolbar } from "polotno/toolbar/toolbar";
import { PagesTimeline } from "polotno/pages-timeline";
import { ZoomButtons } from "polotno/toolbar/zoom-buttons";
import { SidePanel } from "polotno/side-panel";
import { Workspace } from "polotno/canvas/workspace";
import { Button, Menu, MenuItem, Popover, Position } from "@blueprintjs/core";
import { Download } from "@blueprintjs/icons";
import { saveAs } from "file-saver";

import "@blueprintjs/core/lib/css/blueprint.css";

import { createStore } from "polotno/model/store";

const store = createStore({
  key: "nFA5H9elEytDyPyvKL7T", // you can create it here: https://polotno.com/cabinet/
  // you can hide back-link on a paid license
  // but it will be good if you can keep it for Polotno project support
  showCredit: true,
});
store.addPage();

// Custom Side Panel that includes both default panel and narration panel
const CustomSidePanel = ({ store }) => {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <SidePanel store={store} />
    </div>
  );
};

// Custom Download Button Component
const CustomDownloadButton = ({ store }) => {
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
    const json = store.toJSON();

    // Add narration and order properties directly to children
    const jsonWithNarration = {
      ...json,
      pages:
        json.pages?.map((page) => ({
          ...page,
          children:
            page.children
              ?.slice()
              .reverse()
              .map((child, index) => ({
                ...child,
                narration: child.name || "", // Use name as narration
                order: index + 1, // First element in layers gets order 1
              })) || [],
        })) || [],
    };

    const blob = new Blob([JSON.stringify(jsonWithNarration, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "design-with-narration.json");
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

export const App = ({ store }) => {
  // Simple text replacement for layers panel
  React.useEffect(() => {
    const replaceText = () => {
      // Only target text nodes to avoid interfering with React
      const walker = document.createTreeWalker(
        document.querySelector(".polotno-side-panel") || document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent) {
          // Replace all instances of "elements" with "narrations" (case insensitive)
          if (node.textContent.toLowerCase().includes("elements")) {
            node.textContent = node.textContent.replace(
              /elements/gi,
              "Narrations"
            );
          }
          // Replace all instances of "element" with "narration" (case insensitive)
          if (node.textContent.toLowerCase().includes("element")) {
            node.textContent = node.textContent.replace(
              /element/gi,
              "Narration"
            );
          }
        }
      }
    };

    // Run immediately
    replaceText();

    // Use requestAnimationFrame for smooth replacement
    const runReplacement = () => {
      replaceText();
      requestAnimationFrame(runReplacement);
    };

    const animationId = requestAnimationFrame(runReplacement);

    return () => cancelAnimationFrame(animationId);
  }, []);

  // Add page numbers below thumbnails
  React.useEffect(() => {
    const addPageNumbers = () => {
      // Find the pages container
      const pagesContainer = document.querySelector(".polotno-pages-timeline");
      if (!pagesContainer) {
        console.log("Pages container not found");
        return;
      }

      console.log("Pages container found:", pagesContainer);
      console.log("All children:", pagesContainer.children);

      // Look specifically for page containers
      const pageThumbnails = pagesContainer.querySelectorAll(
        ".polotno-page-container"
      );
      console.log("Page containers found:", pageThumbnails.length);

      pageThumbnails.forEach((thumbnail, index) => {
        console.log(`Processing thumbnail ${index + 1}:`, thumbnail);

        // Find the parent container of this thumbnail
        const container = thumbnail.closest("div");
        if (!container) {
          console.log("No container found for thumbnail");
          return;
        }

        console.log("Container found:", container);

        // Check if number already exists
        if (container.querySelector(".page-number")) {
          console.log("Number already exists, skipping");
          return;
        }

        // Create editable number element
        const number = document.createElement("div");
        number.className = "page-number";
        number.textContent = (index + 1).toString();
        number.style.cssText =
          "position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 11px; color: #666; text-align: center; background: white; padding: 2px; border-radius: 2px; cursor: pointer; border: 1px solid transparent; min-width: 20px; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";

        // Make it editable on click
        number.addEventListener("click", () => {
          // Create modal overlay
          const modal = document.createElement("div");
          modal.style.cssText =
            "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;";

          // Create modal content
          const modalContent = document.createElement("div");
          modalContent.style.cssText =
            "background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); min-width: 300px;";

          // Create title
          const title = document.createElement("h3");
          title.textContent = "Edit Page Name";
          title.style.cssText =
            "margin: 0 0 15px 0; font-size: 16px; color: #333;";

          // Create input
          const input = document.createElement("input");
          input.type = "text";
          input.value = number.textContent;
          input.placeholder = "Enter page name...";
          input.style.cssText =
            "width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; outline: none; box-sizing: border-box;";

          // Create buttons container
          const buttonsContainer = document.createElement("div");
          buttonsContainer.style.cssText =
            "display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;";

          // Create Save button
          const saveBtn = document.createElement("button");
          saveBtn.textContent = "Save";
          saveBtn.style.cssText =
            "background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;";

          // Create Cancel button
          const cancelBtn = document.createElement("button");
          cancelBtn.textContent = "Cancel";
          cancelBtn.style.cssText =
            "background: #f5f5f5; color: #333; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;";

          // Assemble modal
          buttonsContainer.appendChild(cancelBtn);
          buttonsContainer.appendChild(saveBtn);
          modalContent.appendChild(title);
          modalContent.appendChild(input);
          modalContent.appendChild(buttonsContainer);
          modal.appendChild(modalContent);
          document.body.appendChild(modal);

          // Focus input
          input.focus();
          input.select();

          // Handle save
          const saveEdit = () => {
            const newText = input.value.trim() || (index + 1).toString();
            number.textContent = newText;
            number.title = newText; // Show full text on hover
            document.body.removeChild(modal);
          };

          // Handle cancel
          const cancelEdit = () => {
            document.body.removeChild(modal);
          };

          // Event listeners
          saveBtn.addEventListener("click", saveEdit);
          cancelBtn.addEventListener("click", cancelEdit);
          modal.addEventListener("click", (e) => {
            if (e.target === modal) cancelEdit();
          });

          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveEdit();
            } else if (e.key === "Escape") {
              cancelEdit();
            }
          });
        });

        // Add to container
        container.style.position = "relative";
        container.appendChild(number);

        console.log(`Added number ${index + 1} to container:`, container);
      });
    };

    // Run immediately and set up observer for new pages
    addPageNumbers();

    // Set up observer to watch for new pages
    const observer = new MutationObserver(() => {
      addPageNumbers();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Ensure pages container stays open
  React.useEffect(() => {
    const ensurePagesOpen = () => {
      // Hide the entire navbar/header section
      const navbar = document.querySelector(
        ".polotno-pages-timeline .bp4-navbar"
      );
      if (navbar) {
        navbar.style.display = "none";
        navbar.style.visibility = "hidden";
      }

      // Find and hide any toggle buttons
      const toggleButtons = document.querySelectorAll(
        '.polotno-pages-timeline .bp4-button[aria-label*="pages"], ' +
          ".polotno-pages-timeline .bp4-navbar .bp4-button:first-child"
      );
      toggleButtons.forEach((button) => {
        button.style.display = "none";
        button.style.visibility = "hidden";
      });

      // Hide any text containing "Pages"
      const pagesText = document.querySelectorAll(
        '.polotno-pages-timeline *[aria-label*="pages"], ' +
          '.polotno-pages-timeline *[title*="pages"]'
      );
      pagesText.forEach((element) => {
        element.style.display = "none";
        element.style.visibility = "hidden";
      });

      // Ensure the pages container is visible
      const pagesContainer = document.querySelector(".polotno-pages-timeline");
      if (pagesContainer) {
        pagesContainer.style.height = "auto";
        pagesContainer.style.maxHeight = "none";
        pagesContainer.style.display = "block";
      }
    };

    // Run immediately
    ensurePagesOpen();

    // Set up observer to maintain the state
    const observer = new MutationObserver(() => {
      ensurePagesOpen();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Cleanup
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <PolotnoContainer style={{ width: "100vw", height: "100vh" }}>
        <SidePanelWrap>
          <CustomSidePanel store={store} />
        </SidePanelWrap>
        <WorkspaceWrap>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              borderBottom: "1px solid #e1e5e9",
            }}
          >
            <Toolbar store={store} downloadButtonEnabled={false} />
            <CustomDownloadButton store={store} />
          </div>
          <Workspace store={store} />
          <ZoomButtons store={store} />
          <PagesTimeline store={store} defaultOpened={true} />
        </WorkspaceWrap>
      </PolotnoContainer>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App store={store} />);
