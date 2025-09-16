import React from "react";
import ReactDOM from "react-dom/client";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { Toolbar } from "polotno/toolbar/toolbar";
import { PagesTimeline } from "polotno/pages-timeline";
import { ZoomButtons } from "polotno/toolbar/zoom-buttons";
import { SidePanel } from "polotno/side-panel";
import { Workspace } from "polotno/canvas/workspace";
import {
  Button,
  Menu,
  MenuItem,
  Popover,
  Position,
  TextArea,
  FormGroup,
} from "@blueprintjs/core";
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
