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
  
  /* Force all nested elements to be vertical but NOT take full height */
  .polotno-pages-timeline * {
    flex-direction: column !important;
  }
  
  /* Target the Blueprint navbar that contains the pages */
  .polotno-pages-timeline .bp5-navbar {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    height: 100vh !important;
    min-height: 100vh !important;
    max-height: 100vh !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    flex: 1 !important;
  }
  
  /* Target the navbar group inside - this is the key element */
  .polotno-pages-timeline .bp5-navbar-group {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    height: 100% !important;
    min-height: 100% !important;
    flex: 1 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }
  
  /* Target the specific div that contains the page containers */
  .polotno-pages-timeline .bp5-navbar-group > div {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    height: 100% !important;
    min-height: 100% !important;
    flex: 1 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }
  
  /* Ensure the container div also takes full height */
  .polotno-pages-timeline > div {
    height: 100% !important;
    min-height: 100% !important;
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  /* Keep individual page thumbnails at their original size */
  .polotno-pages-timeline .polotno-page-container {
    height: 60px !important;
    min-height: 60px !important;
    max-height: none !important;
    flex: none !important;
    width: 60px !important;
    margin-bottom: 20px !important;
  }
  
  /* Keep page thumbnail images at original size */
  .polotno-pages-timeline .polotno-page-container img {
    height: 60px !important;
    min-height: 60px !important;
    max-height: none !important;
    width: 100% !important;
    object-fit: contain !important;
  }
`;

// Inject the CSS
const style = document.createElement("style");
style.textContent = verticalPagesCSS;
document.head.appendChild(style);

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
          // Replace all instances of "elements" with "shapes" (case insensitive)
          if (node.textContent.toLowerCase().includes("elements")) {
            node.textContent = node.textContent.replace(/elements/gi, "Shapes");
          }
          // Replace all instances of "element" with "shape" (case insensitive)
          if (node.textContent.toLowerCase().includes("element")) {
            node.textContent = node.textContent.replace(/element/gi, "Shape");
          }
          // Add supported formats text to upload section
          if (node.textContent.includes("Upload your assets")) {
            node.textContent = "Upload your assets (.jpg, .png, .gif, .svg)";
          }
          // Add supported formats text to font upload section
          if (node.textContent.includes("Upload font")) {
            // Don't modify the button text, we'll add separate text below it
            return;
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
          "position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 11px; color: #666; text-align: center; background: transparent; padding: 2px; border-radius: 2px; cursor: pointer; border: 1px solid transparent; min-width: 20px; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";

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

  // Add font formats text below upload button
  React.useEffect(() => {
    const addFontFormatsText = () => {
      // Find all upload font buttons
      const uploadButtons = document.querySelectorAll("button");

      uploadButtons.forEach((button) => {
        if (button.textContent.includes("Upload font")) {
          // Check if formats text already exists
          const existingText =
            button.parentElement.querySelector(".font-formats-text");
          if (existingText) return;

          // Create formats text element
          const formatsText = document.createElement("div");
          formatsText.className = "font-formats-text";
          formatsText.textContent = "(.ttf, .otf, .woff, .woff2, .eot)";
          formatsText.style.cssText =
            "font-size: 12px; color: #666; margin-top: 4px; text-align: center;";

          // Insert after the button
          button.parentElement.insertBefore(formatsText, button.nextSibling);
        }
      });
    };

    // Run immediately and on DOM changes
    addFontFormatsText();

    const observer = new MutationObserver(() => {
      addFontFormatsText();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Add file upload restrictions
  React.useEffect(() => {
    const restrictFileUploads = () => {
      // Find all file input elements
      const fileInputs = document.querySelectorAll('input[type="file"]');

      fileInputs.forEach((input) => {
        // Set accept attribute to restrict file types in native file picker
        // Check if this is a font upload input by looking for font-related context
        const isFontInput =
          // Check if input is near "Upload font" text
          input.closest("div")?.textContent?.includes("Upload font") ||
          // Check if input is in a font-related section
          input.closest('[class*="font"]') ||
          input.closest('[class*="typography"]') ||
          // Check if there's a "Upload font" button nearby
          document
            .querySelector('button[class*="upload"]')
            ?.textContent?.includes("Upload font") ||
          // Check parent elements for font context
          input
            .closest("div")
            ?.querySelector("button")
            ?.textContent?.includes("Upload font");

        if (isFontInput) {
          // Font file formats
          input.setAttribute(
            "accept",
            ".ttf,.otf,.woff,.woff2,.eot,font/ttf,font/otf,application/font-woff,application/font-woff2,application/vnd.ms-fontobject"
          );
          console.log("Font input detected, setting font accept attribute");
        } else {
          // Image file formats (default)
          input.setAttribute(
            "accept",
            ".jpg,.jpeg,.png,.gif,.svg,image/jpeg,image/png,image/gif,image/svg+xml"
          );
          console.log("Image input detected, setting image accept attribute");
        }

        // Remove existing event listeners to avoid duplicates
        input.removeEventListener("change", handleFileUpload);
        input.addEventListener("change", handleFileUpload);
      });
    };

    const handleFileUpload = (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      // Check if this is a font upload input
      const isFontInput =
        // Check if input is near "Upload font" text
        event.target.closest("div")?.textContent?.includes("Upload font") ||
        // Check if input is in a font-related section
        event.target.closest('[class*="font"]') ||
        event.target.closest('[class*="typography"]') ||
        // Check if there's a "Upload font" button nearby
        document
          .querySelector('button[class*="upload"]')
          ?.textContent?.includes("Upload font") ||
        // Check parent elements for font context
        event.target
          .closest("div")
          ?.querySelector("button")
          ?.textContent?.includes("Upload font");

      let supportedTypes, supportedExtensions, supportedFormatsText;

      if (isFontInput) {
        // Font file formats
        supportedTypes = [
          "font/ttf",
          "font/otf",
          "application/font-woff",
          "application/font-woff2",
          "application/vnd.ms-fontobject",
        ];
        supportedExtensions = [".ttf", ".otf", ".woff", ".woff2", ".eot"];
        supportedFormatsText = ".ttf, .otf, .woff, .woff2, .eot";
      } else {
        // Image file formats (default)
        supportedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/svg+xml",
        ];
        supportedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg"];
        supportedFormatsText = ".jpg, .png, .gif, .svg";
      }

      const validFiles = [];
      const invalidFiles = [];

      Array.from(files).forEach((file) => {
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.substring(fileName.lastIndexOf("."));
        const isValidType =
          supportedTypes.includes(file.type) ||
          supportedExtensions.includes(fileExtension);

        if (isValidType) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file);
        }
      });

      if (invalidFiles.length > 0) {
        const invalidFileNames = invalidFiles.map((f) => f.name).join(", ");
        const fileTypeText = isFontInput ? "font files" : "image files";
        alert(
          `The following files are not supported: ${invalidFileNames}\n\nSupported ${fileTypeText}: ${supportedFormatsText}`
        );

        // Clear the input to prevent upload
        event.target.value = "";
        return;
      }

      if (validFiles.length > 0) {
        // Create a new FileList with only valid files
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => dataTransfer.items.add(file));
        event.target.files = dataTransfer.files;
      }
    };

    // Run immediately and on any DOM changes
    restrictFileUploads();

    // Also run when new file inputs are added
    const observer = new MutationObserver(() => {
      restrictFileUploads();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Pages Timeline - Top Left Position */}
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100px",
          height: "100vh",
          zIndex: "1000",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
        }}
      >
        <PagesTimeline store={store} defaultOpened={true} />
      </div>

      <PolotnoContainer
        style={{
          width: "calc(100vw - 100px)",
          height: "100vh",
          marginLeft: "100px",
        }}
      >
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
