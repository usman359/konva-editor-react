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

// Add custom CSS for vertical pages timeline
const verticalPagesCSS = `
  /* Force the pages timeline container to take full height and be vertical */
  .polotno-pages-timeline {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    padding: 10px 5px !important;
    height: 100vh !important;
    min-height: 100vh !important;
    max-height: 100vh !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    justify-content: flex-start !important;
    box-sizing: border-box !important;
    position: relative !important;
  }
  
  /* Target the Blueprint navbar that contains the pages */
  .polotno-pages-timeline .bp5-navbar {
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    padding: 10px 5px !important;
    box-sizing: border-box !important;
    position: relative !important;
    overflow-x: hidden !important;
    overflow-y: visible !important;
  }
  
  /* Target the navbar group inside - this is the key element */
  .polotno-pages-timeline .bp5-navbar-group {
    height: auto !important;
    min-height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    flex: none !important;
    overflow-x: hidden !important;
    overflow-y: visible !important;
  }
  
  /* Target the specific div that contains the page containers */
  .polotno-pages-timeline .bp5-navbar-group > div {
    height: auto !important;
    min-height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    flex: none !important;
    overflow-x: hidden !important;
    overflow-y: visible !important;
  }
  
  /* Target the actual container that holds the pages */
  .polotno-pages-timeline .bp5-navbar-group > div > div {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: 100% !important;
    height: 100% !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }
  
  /* Page containers styling - force vertical layout */
  .polotno-pages-timeline .polotno-page-container {
    margin: 5px auto !important;
    margin-right: auto !important;
    margin-left: auto !important;
    margin-bottom: 25px !important;
    flex-shrink: 0 !important;
    width: 60px !important;
    height: 60px !important;
    position: relative !important;
  }
  
  /* Page number positioning - ensure it's below the thumbnail */
  .polotno-pages-timeline .page-number {
    position: absolute !important;
    bottom: -20px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    font-size: 11px !important;
    color: #666 !important;
    text-align: center !important;
    background: white !important;
    padding: 2px !important;
    border-radius: 2px !important;
    cursor: pointer !important;
    border: 1px solid transparent !important;
    min-width: 20px !important;
    max-width: 60px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    z-index: 10 !important;
  }
  
  /* Ensure any wrapper divs take full height */
  .polotno-pages-timeline > div {
    height: 100% !important;
    min-height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    flex: 1 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }
  
  /* Override any horizontal flex layouts */
  .polotno-pages-timeline * {
    flex-direction: column !important;
  }
  
  /* Specifically target any elements that might be forcing horizontal layout */
  .polotno-pages-timeline .bp5-navbar-group,
  .polotno-pages-timeline .bp5-navbar-group > div,
  .polotno-pages-timeline .bp5-navbar-group > div > div {
    flex-direction: column !important;
    flex-wrap: nowrap !important;
  }
  
  /* Force container elements to take full available height, but not page thumbnails */
  .polotno-pages-timeline,
  .polotno-pages-timeline .bp5-navbar,
  .polotno-pages-timeline .bp5-navbar-group,
  .polotno-pages-timeline .bp5-navbar-group > div {
    height: 100% !important;
    min-height: 100% !important;
  }
  
  /* Keep page containers at their original size */
  .polotno-pages-timeline .polotno-page-container {
    height: 60px !important;
    min-height: 60px !important;
    max-height: 60px !important;
    width: 60px !important;
    flex-shrink: 0 !important;
  }
`;

// Inject the CSS
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = verticalPagesCSS;
  document.head.appendChild(style);
}

const store = createStore({
  key: "nFA5H9elEytDyPyvKL7T", // you can create it here: https://polotno.com/cabinet/
  // you can hide back-link on a paid license
  // but it will be good if you can keep it for Polotno project support
  showCredit: true,
});
store.addPage();

// Custom Side Panel that includes both default panel and narration panel
const CustomSidePanel = ({ store }) => {
  // Force pages timeline to take full height and be vertical
  React.useEffect(() => {
    const forceVerticalLayout = () => {
      const pagesTimeline = document.querySelector(".polotno-pages-timeline");
      const navbar = document.querySelector(
        ".polotno-pages-timeline .bp5-navbar"
      );
      const navbarGroup = document.querySelector(
        ".polotno-pages-timeline .bp5-navbar-group"
      );

      // Find all nested divs that might contain pages
      const allDivs = document.querySelectorAll(".polotno-pages-timeline div");

      // Get the viewport height
      const viewportHeight = window.innerHeight;

      if (pagesTimeline) {
        pagesTimeline.style.height = `${viewportHeight}px`;
        pagesTimeline.style.minHeight = `${viewportHeight}px`;
        pagesTimeline.style.maxHeight = `${viewportHeight}px`;
        pagesTimeline.style.flexDirection = "column";
        pagesTimeline.style.overflowX = "hidden";
        pagesTimeline.style.overflowY = "auto";
        pagesTimeline.style.position = "relative";
        pagesTimeline.style.display = "flex";
      }

      if (navbar) {
        navbar.style.height = "auto";
        navbar.style.minHeight = "auto";
        navbar.style.maxHeight = "none";
        navbar.style.flexDirection = "column";
        navbar.style.overflowX = "hidden";
        navbar.style.overflowY = "visible";
        navbar.style.position = "relative";
        navbar.style.display = "flex";
      }

      if (navbarGroup) {
        navbarGroup.style.height = "auto";
        navbarGroup.style.minHeight = "auto";
        navbarGroup.style.flex = "none";
        navbarGroup.style.flexDirection = "column";
        navbarGroup.style.overflowX = "hidden";
        navbarGroup.style.overflowY = "visible";
        navbarGroup.style.position = "relative";
        navbarGroup.style.display = "flex";
      }

      // Force all nested divs to be vertical, but keep page containers at original size
      allDivs.forEach((div) => {
        if (div.closest(".polotno-pages-timeline")) {
          // Skip page containers - keep them at original size and center them
          if (div.classList.contains("polotno-page-container")) {
            div.style.height = "60px";
            div.style.minHeight = "60px";
            div.style.maxHeight = "60px";
            div.style.width = "60px";
            div.style.flexShrink = "0";
            div.style.margin = "5px auto";
            div.style.position = "relative";
            return;
          }

          // For other divs, make them take auto height
          div.style.flexDirection = "column";
          div.style.overflowX = "hidden";
          div.style.overflowY = "visible";
          div.style.height = "auto";
          div.style.minHeight = "auto";
          div.style.display = "flex";
        }
      });
    };

    // Run immediately and on any DOM changes
    forceVerticalLayout();
    const interval = setInterval(forceVerticalLayout, 50); // More frequent updates

    // Also run on window resize
    window.addEventListener("resize", forceVerticalLayout);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", forceVerticalLayout);
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div
        style={{
          width: "100px",
          height: "100vh",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <PagesTimeline store={store} defaultOpened={true} />
      </div>
      <div
        style={{
          flex: 1,
          height: "100vh",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SidePanel store={store} />
      </div>
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
  // Save to localStorage whenever store changes
  React.useEffect(() => {
    let userClearedStorage = false;
    let hasInitialData = false;

    // Check if there's initial data in localStorage
    const checkInitialState = () => {
      const savedState = localStorage.getItem("polotno-demo-state");
      if (savedState !== null) {
        hasInitialData = true;
        console.log("Found existing data in localStorage");
      } else {
        console.log("No existing data in localStorage (first time or cleared)");
      }
    };

    checkInitialState();

    const saveToLocalStorage = () => {
      try {
        // Only skip if user manually cleared it during the session (not on initial load)
        if (userClearedStorage && hasInitialData) {
          console.log(
            "Skipping auto-save - user cleared localStorage during session"
          );
          return;
        }

        console.log("Attempting to save to localStorage...");
        const json = store.toJSON();
        console.log("Store JSON:", json);
        localStorage.setItem("polotno-demo-state", JSON.stringify(json));
        console.log("Successfully saved to localStorage");
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    };

    // Save on any store change
    const handleStoreChange = () => {
      saveToLocalStorage();
    };

    // Listen for store changes
    if (store.on) {
      store.on("change", handleStoreChange);
      store.on("update", handleStoreChange);
      store.on("selection:change", handleStoreChange);
      console.log("Store event listeners attached");
    } else {
      console.log("Store.on not available, using fallback approach");
    }

    // Manual save trigger for testing
    const manualSave = () => {
      console.log("Manual save triggered");
      saveToLocalStorage();
    };

    // Add manual save to window for testing
    window.manualSave = manualSave;

    // Also save periodically as backup
    const saveInterval = setInterval(saveToLocalStorage, 5000);

    // Test save immediately
    setTimeout(() => {
      console.log("Testing immediate save...");
      saveToLocalStorage();
    }, 1000);

    // Listen for storage changes to detect if user manually cleared it
    const handleStorageChange = (e) => {
      if (
        e.key === "polotno-demo-state" &&
        e.newValue === null &&
        e.oldValue !== null
      ) {
        userClearedStorage = true;
        console.log("Detected manual localStorage clear during session");
      } else if (e.key === "polotno-demo-state" && e.newValue !== null) {
        userClearedStorage = false;
        console.log("Detected localStorage restore, resuming auto-save");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (store.off) {
        store.off("change", handleStoreChange);
        store.off("update", handleStoreChange);
        store.off("selection:change", handleStoreChange);
      }
      clearInterval(saveInterval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [store]);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const savedState = localStorage.getItem("polotno-demo-state");
      if (savedState) {
        const json = JSON.parse(savedState);
        store.loadJSON(json);
        console.log("Loaded from localStorage");
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }, [store]);

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

  // Add modal functionality to narration input fields in layers panel
  React.useEffect(() => {
    const addModalToInputs = () => {
      // Find all input fields in the side panel
      const sidePanel = document.querySelector(".polotno-side-panel");
      if (!sidePanel) return;

      const inputs = sidePanel.querySelectorAll("input[type='text'], textarea");

      inputs.forEach((input) => {
        // Skip if already processed
        if (input.dataset.modalAdded) return;

        // Mark as processed
        input.dataset.modalAdded = "true";

        // Add click handler to make input directly editable
        input.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Make the input directly editable instead of opening modal
          console.log("Making input directly editable...");

          // Focus and select the input
          input.focus();
          input.select();

          // Remove any readonly/disabled attributes
          input.removeAttribute("readonly");
          input.removeAttribute("disabled");

          // Add event listeners for saving changes
          const handleKeyDown = (keyEvent) => {
            if (keyEvent.key === "Enter") {
              keyEvent.preventDefault();
              input.blur(); // This will trigger the blur event
            }
          };

          const handleBlur = () => {
            const newText = input.value.trim();
            console.log("Input value changed to:", newText);

            // Update the Polotno store
            try {
              const selectedElements = store.selectedElements;
              if (selectedElements && selectedElements.length > 0) {
                const selectedElement = selectedElements[0];
                selectedElement.set("name", newText);
                console.log("Updated element name in store:", newText);
              }
            } catch (error) {
              console.log("Could not update store:", error);
            }

            // Remove event listeners
            input.removeEventListener("keydown", handleKeyDown);
            input.removeEventListener("blur", handleBlur);
          };

          input.addEventListener("keydown", handleKeyDown);
          input.addEventListener("blur", handleBlur);

          // Continue with modal logic as fallback

          // Store the original text before opening modal
          let originalText = input.value || input.getAttribute("value") || "";

          // If no text found, try to get it from the selected element in the store
          if (!originalText) {
            try {
              const selectedElements = store.selectedElements;
              if (selectedElements && selectedElements.length > 0) {
                originalText = selectedElements[0].name || "";
              }
            } catch (error) {
              console.log("Could not get text from store:", error);
            }
          }

          // If still no text, try to get it from the parent element or nearby text
          if (!originalText) {
            // Look for text in the parent container
            const parent = input.closest(
              ".polotno-element-item, .bp5-menu-item, [data-element-id]"
            );
            if (parent) {
              const textElement =
                parent.querySelector("span, div, p") || parent;
              originalText = textElement.textContent?.trim() || "";
            }
          }

          // If still no text, try to get the actual element text from the store
          if (!originalText) {
            try {
              const selectedElements = store.selectedElements;
              if (selectedElements && selectedElements.length > 0) {
                const element = selectedElements[0];
                // Try different properties that might contain the element text
                originalText =
                  element.text || element.name || element.content || "";
                console.log("Got element text from store:", originalText);
              }
            } catch (error) {
              console.log("Could not get element text from store:", error);
            }
          }

          // If still no text, check if input has placeholder and use that as starting point
          if (!originalText && input.placeholder) {
            originalText = input.placeholder;
          }

          // If still no text, try to get the default element name from the selected element
          if (!originalText) {
            try {
              const selectedElements = store.selectedElements;
              if (selectedElements && selectedElements.length > 0) {
                const selectedElement = selectedElements[0];
                // Get the element type and create a default name
                const elementType = selectedElement.type || "Element";
                originalText = `${elementType} ${Date.now()
                  .toString()
                  .slice(-4)}`;
                console.log("Using default element name:", originalText);
              }
            } catch (error) {
              console.log("Could not get default element name:", error);
            }
          }

          // Final fallback
          if (!originalText) {
            originalText = `Element ${Date.now().toString().slice(-4)}`;
          }

          console.log("Captured original text:", originalText);
          console.log("Input element:", input);
          console.log("Input value:", input.value);
          console.log("Input placeholder:", input.placeholder);
          console.log("Input attributes:", input.getAttribute("value"));
          console.log("Input parent:", input.parentElement);
          console.log("Input parent text:", input.parentElement?.textContent);

          // If still no text, let's try a more aggressive approach
          if (!originalText) {
            // Look for any text in the entire parent hierarchy
            let currentElement = input.parentElement;
            while (currentElement && !originalText) {
              const text = currentElement.textContent?.trim();
              if (text && text !== "Type element name..." && text.length > 0) {
                // Extract just the element name part (before any icons or buttons)
                const lines = text.split("\n").filter((line) => line.trim());
                for (const line of lines) {
                  if (
                    line.trim() &&
                    !line.includes("👁") &&
                    !line.includes("🔒") &&
                    !line.includes("🗑")
                  ) {
                    originalText = line.trim();
                    break;
                  }
                }
              }
              currentElement = currentElement.parentElement;
            }
          }

          // Final fallback - if still no text, try to get it from the store again
          if (!originalText) {
            try {
              const selectedElements = store.selectedElements;
              if (selectedElements && selectedElements.length > 0) {
                originalText =
                  selectedElements[0].name || selectedElements[0].text || "";
                console.log("Got text from store as fallback:", originalText);
              }
            } catch (error) {
              console.log("Store fallback failed:", error);
            }
          }

          console.log("Final captured text:", originalText);

          // Open modal immediately on first click
          openModal(originalText);
        });

        // Function to open the modal
        const openModal = (originalText) => {
          // Create modal overlay
          const modal = document.createElement("div");
          modal.style.cssText =
            "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;";

          // Create modal content
          const modalContent = document.createElement("div");
          modalContent.style.cssText =
            "background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); min-width: 400px; max-width: 600px; width: 90%;";

          // Create title
          const title = document.createElement("h3");
          title.textContent = "Edit Narration";
          title.style.cssText =
            "margin: 0 0 15px 0; font-size: 16px; color: #333;";

          // Create textarea
          const textarea = document.createElement("textarea");
          textarea.value = originalText || "";
          textarea.placeholder = "Enter narration for this element...";
          textarea.style.cssText =
            "width: 100%; height: 150px; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; outline: none; box-sizing: border-box; resize: vertical; font-family: inherit;";

          // Create buttons container
          const buttonsContainer = document.createElement("div");
          buttonsContainer.style.cssText =
            "display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;";

          // Create Save button
          const saveBtn = document.createElement("button");
          saveBtn.textContent = "Save Changes";
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
          modalContent.appendChild(textarea);
          modalContent.appendChild(buttonsContainer);
          modal.appendChild(modalContent);
          document.body.appendChild(modal);

          // Focus textarea
          textarea.focus();
          textarea.select();

          // Handle save
          const saveEdit = () => {
            try {
              const newText = textarea.value.trim();
              console.log("=== SAVE FUNCTION CALLED ===");
              console.log("New text from textarea:", newText);
              console.log("Original input value:", input.value);

              // Minimal, reliable update: find selected element and set its fields
              try {
                const selected = store.selectedElements?.[0];
                if (selected) {
                  if (typeof selected.set === "function") {
                    selected.set({ name: newText });
                    // For text elements, also set text so Layers reflects it
                    try {
                      selected.set({ text: newText });
                    } catch (_) {}
                  } else {
                    // fallback
                    selected.name = newText;
                    if ("text" in selected) selected.text = newText;
                  }
                }
              } catch (e) {
                console.log("Direct element update failed:", e);
              }

              // Reflect immediately in the visible input row
              input.value = newText;
              input.setAttribute("value", newText);
              input.placeholder = newText;
              const ev1 = new Event("input", { bubbles: true });
              const ev2 = new Event("change", { bubbles: true });
              input.dispatchEvent(ev1);
              input.dispatchEvent(ev2);

              // Close modal now; avoid further heavy DOM logic
              document.body.removeChild(modal);
              return;
            } catch (error) {
              console.error("Error in saveEdit:", error);
              // Ensure modal closes even if there's an error
              document.body.removeChild(modal);
            }
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

          textarea.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
              saveEdit();
            } else if (e.key === "Escape") {
              cancelEdit();
            }
          });
        };
      });
    };

    // Run immediately and set up observer for new inputs
    addModalToInputs();

    // Set up observer to watch for new input fields
    const observer = new MutationObserver(() => {
      addModalToInputs();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
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
          "position: absolute !important; bottom: -70px !important; left: 50% !important; transform: translateX(-50%) !important; font-size: 11px !important; color: #666 !important; text-align: center !important; background: transparent !important; padding: 2px !important; border-radius: 2px !important; cursor: pointer !important; border: 1px solid transparent !important; min-width: 20px !important; max-width: 60px !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; z-index: 10 !important;";

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
        </WorkspaceWrap>
      </PolotnoContainer>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App store={store} />);
