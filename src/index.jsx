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

// CSS to hide the PagesTimeline header and make it always open
const pagesTimelineStyles = `
  /* Hide the entire navbar/header section of PagesTimeline */
  .polotno-pages-timeline .bp4-navbar {
    display: none !important;
  }
  
  /* Hide the toggle button in PagesTimeline */
  .polotno-pages-timeline .bp4-navbar .bp4-button[aria-label*="pages"],
  .polotno-pages-timeline .bp4-navbar .bp4-button:first-child {
    display: none !important;
  }
  
  /* Ensure the pages container is always visible */
  .polotno-pages-timeline {
    height: auto !important;
    max-height: none !important;
  }
  
  /* Hide any collapse/expand buttons */
  .polotno-pages-timeline .bp4-button[icon="chevron-up"],
  .polotno-pages-timeline .bp4-button[icon="chevron-down"],
  .polotno-pages-timeline .bp4-button[icon="collapse-all"],
  .polotno-pages-timeline .bp4-button[icon="expand-all"] {
    display: none !important;
  }
  
  /* Hide any text that says "Pages" */
  .polotno-pages-timeline *[aria-label*="pages"],
  .polotno-pages-timeline *[title*="pages"],
  .polotno-pages-timeline *:contains("Pages") {
    display: none !important;
  }
`;

// Inject the CSS
const pagesStyle = document.createElement("style");
pagesStyle.textContent = pagesTimelineStyles;
document.head.appendChild(pagesStyle);

const store = createStore({
  key: "nFA5H9elEytDyPyvKL7T", // you can create it here: https://polotno.com/cabinet/
  // you can hide back-link on a paid license
  // but it will be good if you can keep it for Polotno project support
  showCredit: false,
});
const page = store.addPage();

// Background Overlay to hide credit text
const CreditHider = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "100px",
        right: "10px",
        width: "200px",
        height: "30px",
        backgroundColor: "#e7e7e7",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
};

// Custom Download Button Component
const CustomDownloadButton = ({ store }) => {
  const handleSaveAsImage = () => {
    store.download("png");
  };

  const handleSaveAsPDF = () => {
    store.download("pdf");
  };

  const handleSaveAsJSON = () => {
    const json = store.toJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "design.json");
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
          <SidePanel store={store} />
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
      <CreditHider />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App store={store} />);
