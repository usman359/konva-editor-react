import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { SidePanel } from "polotno/side-panel";
import { Toolbar } from "polotno/toolbar/toolbar";
import { ZoomButtons } from "polotno/toolbar/zoom-buttons";
import React from "react";
import ReactDOM from "react-dom/client";
// Native sections API from Polotno
import { Icon, InputGroup } from "@blueprintjs/core";
import { Search, User } from "@blueprintjs/icons";
import { Workspace } from "polotno/canvas/workspace";
import { DEFAULT_SECTIONS, SectionTab } from "polotno/side-panel";
import { Toaster, toast } from "react-hot-toast";

import "@blueprintjs/core/lib/css/blueprint.css";

import { createStore } from "polotno/model/store";
// Build an Avatar panel identical to Photos panel using Polotno internals
import { observer } from "mobx-react-lite";
import { ImagesGrid } from "polotno/side-panel";
import { selectImage } from "polotno/side-panel/select-image";
import { unsplashDownload, unsplashList } from "polotno/utils/api";
import { useInfiniteAPI } from "polotno/utils/use-api";
import CustomCreateButton from "./components/CustomCreateButton";
import CustomDownloadButton from "./components/CustomDownloadButton";
import HierarchicalPagesNavigation from "./components/HierarchicalPagesNavigation";

// Add custom CSS for vertical pages timeline
const verticalPagesCSS = `
  /* Force the pages timeline container to be vertical but with limited height */
  .polotno-pages-timeline {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    padding: 10px 5px !important;
    height: 300px !important;
    min-height: 300px !important;
    max-height: 600px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    justify-content: flex-start !important;
    box-sizing: border-box !important;
    position: relative !important;
  }
  
  /* Center the pages thumbnails horizontally */
  .polotno-pages-timeline .bp5-navbar-group > div {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: 100% !important;
  }
  
  /* Center individual page thumbnails */
  .polotno-pages-timeline .polotno-page-container {
    margin-left: auto !important;
    margin-right: auto !important;
  }
  
  /* Center the plus button in pages timeline */
  .polotno-pages-timeline .bp5-button {
    margin-left: auto !important;
    margin-right: auto !important;
    display: block !important;
  }
  
  /* Center any button or icon in the pages timeline */
  .polotno-pages-timeline .bp5-button,
  .polotno-pages-timeline button {
    margin: 0 45px !important;
    display: block !important;
  }
  
  /* Specifically target the plus button after page thumbnails */
  .polotno-pages-timeline .bp5-button[aria-label*="add"],
  .polotno-pages-timeline .bp5-button[aria-label*="Add"],
  .polotno-pages-timeline .bp5-button[title*="add"],
  .polotno-pages-timeline .bp5-button[title*="Add"] {
    margin: 10px auto !important;
    display: block !important;
    width: 60px !important;
    height: 60px !important;
  }
  
  /* Remove focus styling for plus button in pages timeline */
  .polotno-pages-timeline .bp5-button:focus {
    outline: none !important;
    box-shadow: none !important;
  }
  
  /* Center the plus icon within the button */
  .polotno-pages-timeline .bp5-button svg {
    margin: 0 15px !important;
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
    height: 300px !important;
    min-height: 200px !important;
    max-height: 400px !important;
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
    height: 300px !important;
    min-height: 200px !important;
    max-height: 400px !important;
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
    height: 300px !important;
    min-height: 200px !important;
    max-height: 400px !important;
    flex: 1 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }
  
  /* Ensure the container div also takes limited height */
  .polotno-pages-timeline > div {
    height: 300px !important;
    min-height: 200px !important;
    max-height: 400px !important;
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  /* Keep individual page thumbnails compact */
  .polotno-pages-timeline .polotno-page-container {
    height: 80px !important;
    min-height: 80px !important;
    max-height: none !important;
    flex: none !important;
    width: 80px !important;
    margin-bottom: 20px !important;
  }
  
  /* Keep page thumbnail images at original size */
  .polotno-pages-timeline .polotno-page-container img {
    height: 80px !important;
    min-height: 80px !important;
    max-height: none !important;
    width: 100% !important;
    object-fit: contain !important;
  }
  
  /* Hide only the "Pages" text, not the entire navbar or buttons */
  .polotno-pages-timeline *[aria-label*="Pages"],
  .polotno-pages-timeline *[title*="Pages"],
  .polotno-pages-timeline *[aria-label*="pages"],
  .polotno-pages-timeline *[title*="pages"] {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* Hide text elements that contain only "Pages" */
  .polotno-pages-timeline .bp5-text:contains("Pages"),
  .polotno-pages-timeline .bp4-text:contains("Pages") {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* Fix Add Module button focus outline */
  .bp5-button:focus {
    outline: 2px solid #137cbd !important;
    outline-offset: 2px !important;
  }
  
  /* Remove focus styling for the add module button */
  .bp5-button[data-module-button="true"]:focus {
    outline: none !important;
    box-shadow: none !important;
  }
  
  /* Force centering for the add module button */
  .bp5-button[data-module-button="true"] {
    margin: 0 auto !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }

  /* Force centering for the add chapter button */
  .bp5-button[data-chapter-button="true"] {
    margin: 0 auto !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }

  /* Slide numbers and names styling */
  .polotno-page-container {
    margin-bottom: 40px !important;
    overflow: visible !important;
  }

  .slide-number-container {
    position: absolute !important;
    bottom: -25px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    z-index: 10 !important;
    background: transparent !important;
    box-shadow: none !important;
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

// Make store available globally for onclick handlers
window.polotnoStore = store;

// AvatarPanel: native panel that mirrors Photos, filtered for faces
const AvatarPanel = observer(({ store }) => {
  const { setQuery, loadMore, isReachingEnd, data, isLoading, error } =
    useInfiniteAPI({
      defaultQuery: "avatar", // default query to show faces/portraits
      getAPI: ({ page, query }) => unsplashList({ page, query }),
    });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <InputGroup
        leftIcon={<Search />}
        placeholder="Search"
        onChange={(e) => setQuery(e.target.value)}
        type="search"
        style={{ marginBottom: "20px" }}
      />
      <p style={{ textAlign: "center" }}>
        Photos by{" "}
        <a href="https://unsplash.com/" target="_blank">
          Unsplash
        </a>
      </p>
      <ImagesGrid
        images={data
          ?.map((i) => i.results)
          .flat()
          .filter(Boolean)}
        getPreview={(img) => img.urls.small}
        onSelect={async (img, pos, target) => {
          fetch(unsplashDownload(img.id));
          selectImage({
            src: img.urls.regular,
            store,
            droppedPos: pos,
            targetElement: target,
          });
        }}
        isLoading={isLoading}
        error={error}
        loadMore={!isReachingEnd && loadMore}
        getCredit={(img) => (
          <span>
            Photo by{" "}
            <a
              href={`https://unsplash.com/@${img.user.username}?utm_source=polotno&utm_medium=referral`}
              target="_blank"
            >
              {img.user.name}
            </a>{" "}
            on{" "}
            <a
              href="https://unsplash.com/?utm_source=polotno&utm_medium=referral"
              target="_blank"
            >
              Unsplash
            </a>
          </span>
        )}
      />
    </div>
  );
});

// Native AvatarSection wired into Polotno's side panel
const AvatarSection = {
  name: "avatar",
  Tab: observer((props) => (
    <SectionTab {...props} name="Avatar">
      <Icon icon={<User />} />
    </SectionTab>
  )),
  Panel: ({ store }) => <AvatarPanel store={store} />,
};

// Custom Side Panel that registers native Avatar section
const CustomSidePanel = ({ store }) => {
  const sections = React.useMemo(() => {
    // Insert Avatar right after Photos
    const list = [...DEFAULT_SECTIONS];
    const photosIndex = list.findIndex((s) => s.name === "photos");
    if (photosIndex >= 0) {
      list.splice(photosIndex + 1, 0, AvatarSection);
    } else {
      list.splice(2, 0, AvatarSection);
    }
    return list;
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <SidePanel store={store} sections={sections} />
    </div>
  );
};

export const App = ({ store }) => {
  const [modulesData, setModulesData] = React.useState(null);

  const handleModulesChange = (data) => {
    setModulesData(data);
  };
  // Save to localStorage only for non-page changes to avoid cross-chapter contamination
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

    // Only save on selection changes, not on page changes to prevent cross-chapter contamination
    const handleStoreChange = () => {
      // Don't auto-save on page changes - let the hierarchical navigation handle chapter-specific saving
      console.log(
        "Store changed, but skipping auto-save to prevent cross-chapter contamination"
      );
    };

    // Only listen to selection changes, not page changes
    if (store.on) {
      store.on("selection:change", handleStoreChange);
      console.log(
        "Store selection change listener attached (page changes ignored)"
      );
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

    // Reduced periodic save frequency to minimize interference
    const saveInterval = setInterval(saveToLocalStorage, 30000); // Every 30 seconds instead of 5

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
        store.off("selection:change", handleStoreChange);
      }
      clearInterval(saveInterval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [store]);

  // Load from localStorage on mount - DISABLED to prevent interference with chapter-specific page management
  React.useEffect(() => {
    // This was causing cross-contamination between chapters
    // Chapter-specific page management is now handled in HierarchicalPagesNavigation
    console.log(
      "Global store loading disabled - using chapter-specific management"
    );
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
          // Only replace "Narrations" tab text to "Elements", not other text
          if (
            node.textContent === "Narrations" &&
            node.parentElement?.classList?.contains("bp5-tab")
          ) {
            node.textContent = "Elements";
          }
          // Change "Elements on your active page:" back to "Narrations on your active page:"
          if (node.textContent.includes("Elements on your active page:")) {
            node.textContent = node.textContent.replace(
              "Elements on your active page:",
              "Narrations on your active page:"
            );
          }

          // Change "No elements on your active page:" back to "No Narrations on your active page:"
          if (node.textContent.includes("No elements on the page...")) {
            node.textContent = node.textContent.replace(
              "No elements on the page.",
              "No Narrations on the page..."
            );
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

  // Old DOM-based Avatar tab removed - using native AvatarSection instead

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
                // Don't update the text property - keep original text on canvas
                console.log(
                  "Updated element name (narration) in store:",
                  newText
                );
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
            "width: 100%; height: 160px; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; outline: none; box-sizing: border-box; resize: vertical; font-family: inherit;";

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
                    // Don't update the text property - keep original text on canvas
                    // Only update the name (narration) for the Layers tab
                  } else {
                    // fallback - only update name, not text
                    selected.name = newText;
                    // Don't update text property to keep original text on canvas
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

  // Function to open slide name modal
  const openSlideNameModal = (
    slideNumber,
    currentName,
    onSave,
    onValidationError
  ) => {
    // Create modal overlay
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      background: transparent;
    `;

    // Create modal content with Blueprint styling
    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
      background: white;
      border-radius: 6px;
      box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.1), 0 4px 8px rgba(16, 22, 26, 0.2), 0 18px 46px 6px rgba(16, 22, 26, 0.2);
      width: 400px;
      max-width: 90vw;
    `;

    // Create header
    const header = document.createElement("div");
    header.style.cssText = `
      padding: 20px 20px 0 20px;
      border-bottom: 1px solid rgba(16, 22, 26, 0.15);
    `;

    const title = document.createElement("h4");
    title.textContent = `Edit Slide ${slideNumber} Name`;
    title.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: #182026;
      line-height: 1.2;
    `;

    // Create body
    const body = document.createElement("div");
    body.style.cssText = `
      padding: 20px;
    `;

    // Create label
    const label = document.createElement("label");
    label.textContent = "Slide Name:";
    label.style.cssText = `
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #182026;
      font-size: 14px;
    `;

    // Create input with Blueprint styling
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentName;
    input.placeholder = "Enter slide name...";
    input.style.cssText = `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d3d8de;
      border-radius: 3px;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      background: #ffffff;
      color: #182026;
      transition: border-color 0.2s ease;
    `;

    // Add focus styling
    input.addEventListener("focus", () => {
      input.style.borderColor = "#137cbd";
      input.style.boxShadow = "0 0 0 1px #137cbd";
    });

    input.addEventListener("blur", () => {
      input.style.borderColor = "#d3d8de";
      input.style.boxShadow = "none";
    });

    // Create footer
    const footer = document.createElement("div");
    footer.style.cssText = `
      padding: 0 20px 20px 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    `;

    // Create Cancel button with Blueprint styling
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `
      background: #f5f8fa;
      color: #182026;
      border: 1px solid #d3d8de;
      padding: 8px 16px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    `;

    // Create Save button with Blueprint styling
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.style.cssText = `
      background: #137cbd;
      color: white;
      border: 1px solid #137cbd;
      padding: 8px 16px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    `;

    // Add hover effects
    cancelBtn.addEventListener("mouseenter", () => {
      cancelBtn.style.background = "#ebf1f5";
    });
    cancelBtn.addEventListener("mouseleave", () => {
      cancelBtn.style.background = "#f5f8fa";
    });

    saveBtn.addEventListener("mouseenter", () => {
      saveBtn.style.background = "#106ba3";
    });
    saveBtn.addEventListener("mouseleave", () => {
      saveBtn.style.background = "#137cbd";
    });

    // Assemble modal
    header.appendChild(title);
    body.appendChild(label);
    body.appendChild(input);
    footer.appendChild(cancelBtn);
    footer.appendChild(saveBtn);
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modalContent.appendChild(footer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Focus input
    input.focus();
    input.select();

    // Handle save
    const saveEdit = () => {
      const newName = input.value.trim() || `Slide ${slideNumber}`;

      // Check if there's a validation error callback
      if (onValidationError) {
        const validationResult = onValidationError(newName);
        if (validationResult === false) {
          // Validation failed, don't close modal
          return;
        }
      }

      onSave(newName);
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
        e.preventDefault();
        cancelEdit();
      }
    });
  };

  // Add slide numbers and name editing functionality
  React.useEffect(() => {
    // Clear any "new slide" entries from localStorage to fix naming issues
    try {
      const savedNames = JSON.parse(
        localStorage.getItem("polotno-demo-page-names") || "{}"
      );
      let hasChanges = false;
      Object.keys(savedNames).forEach((key) => {
        if (savedNames[key] === "new slide") {
          delete savedNames[key];
          hasChanges = true;
        }
      });
      if (hasChanges) {
        localStorage.setItem(
          "polotno-demo-page-names",
          JSON.stringify(savedNames)
        );
        console.log("Cleared 'new slide' entries from localStorage");
      }
    } catch (e) {
      console.error("Error clearing 'new slide' entries:", e);
    }

    // Helpers for per-chapter slide name map keyed by page ID
    const getActiveScopeKeys = () => {
      const chapterId = modulesData?.activeChapterId || "default";
      const moduleId = modulesData?.activeModuleId || 1;
      return { moduleId, chapterId };
    };

    const loadNameMap = (moduleId, chapterId) => {
      try {
        const key = `slide-name-map-${moduleId}-${chapterId}`;
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        console.error("Error loading name map:", e);
        return {};
      }
    };

    const saveNameMap = (moduleId, chapterId, map) => {
      try {
        const key = `slide-name-map-${moduleId}-${chapterId}`;
        localStorage.setItem(key, JSON.stringify(map));
      } catch (e) {
        console.error("Error saving name map:", e);
      }
    };

    const maybeMigrateNamesFromSavedOrder = (moduleId, chapterId) => {
      // If we have an old saved slide-order (names) and an id order, migrate to id->name map once
      try {
        const nameMapKey = `slide-name-map-${moduleId}-${chapterId}`;
        const existing = localStorage.getItem(nameMapKey);
        if (existing) return; // already migrated/exists

        const idKey = `slide-id-order-${moduleId}-${chapterId}`;
        const nameKey = `slide-order-${moduleId}-${chapterId}`;
        const idRaw = localStorage.getItem(idKey);
        const nameRaw = localStorage.getItem(nameKey);
        if (!idRaw || !nameRaw) return;
        const ids = JSON.parse(idRaw);
        const names = JSON.parse(nameRaw);
        if (!Array.isArray(ids) || !Array.isArray(names)) return;
        if (ids.length !== names.length) return;
        const map = {};
        ids.forEach((id, i) => {
          map[id] = names[i] || `Slide ${i + 1}`;
        });
        localStorage.setItem(nameMapKey, JSON.stringify(map));
      } catch (e) {
        console.error("Error migrating names from saved order:", e);
      }
    };

    const addSlideNumbersAndNames = () => {
      // Find only the currently visible PagesTimeline component to avoid cross-contamination
      const activePagesTimeline = document.querySelector(
        ".polotno-pages-timeline"
      );
      if (!activePagesTimeline) return;

      // Process only the active PagesTimeline
      const pagesTimelines = [activePagesTimeline];

      pagesTimelines.forEach((timeline) => {
        // Find page containers
        const pageContainers = timeline.querySelectorAll(
          ".polotno-page-container"
        );

        // Prepare per-chapter name map
        const { moduleId, chapterId } = getActiveScopeKeys();
        maybeMigrateNamesFromSavedOrder(moduleId, chapterId);
        let nameMap = loadNameMap(moduleId, chapterId);

        // Initialize name map once per chapter if empty
        try {
          const storePages = store.pages || [];
          if (!nameMap || Object.keys(nameMap).length === 0) {
            const initialMap = {};
            storePages.forEach((p, i) => {
              if (p?.id) initialMap[p.id] = `Slide ${i + 1}`;
            });
            saveNameMap(moduleId, chapterId, initialMap);
            nameMap = initialMap;
          } else {
            // Ensure any newly added page gets a default name
            (storePages || []).forEach((p, i) => {
              if (p?.id && !nameMap[p.id]) {
                nameMap[p.id] = `Slide ${i + 1}`;
              }
            });
            saveNameMap(moduleId, chapterId, nameMap);
          }
        } catch (e) {
          console.error("Error initializing/updating name map:", e);
        }

        pageContainers.forEach((container, index) => {
          // Check if slide name already exists for this container to avoid duplicates
          if (container.querySelector(".slide-number-container")) {
            return;
          }
          // Create slide number and name container
          const slideContainer = document.createElement("div");
          slideContainer.className = "slide-number-container";
          slideContainer.style.cssText = `
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 10;
            padding: 4px 8px;
            border-radius: 4px;
            min-width: 80px;
            max-width: 80px;
            width: 80px;
          `;

          // Create slide name
          const slideName = document.createElement("div");
          // Determine page ID from store by index (DOM order matches store pages order)
          const pageId = (store.pages || [])[index]?.id;
          const defaultName = `Slide ${index + 1}`;
          const resolvedName = (pageId && nameMap[pageId]) || defaultName;
          slideName.textContent = resolvedName;
          slideName.style.cssText = `
            font-size: 11px;
            color: #333;
            text-align: center;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 3px;
            transition: background-color 0.2s ease;
            line-height: 1.2;
            min-height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          `;

          // Add hover effects
          slideName.addEventListener("mouseenter", () => {
            slideName.style.backgroundColor = "rgba(0, 122, 204, 0.1)";
          });
          slideName.addEventListener("mouseleave", () => {
            slideName.style.backgroundColor = "transparent";
          });

          // Add click handlers for editing
          const editSlideName = () => {
            const currentName = slideName.textContent;

            // Validation function that returns false if validation fails
            const validateSlideName = (newName) => {
              // Check for duplicate slide names within the same chapter
              const allSlideNames = Array.from(pageContainers)
                .map((container, slideIndex) => {
                  if (slideIndex === index) return null; // Skip current slide
                  const existingSlideName = container.querySelector(
                    ".slide-number-container > div"
                  );
                  return existingSlideName
                    ? existingSlideName.textContent
                    : `Slide ${slideIndex + 1}`;
                })
                .filter(Boolean);

              const trimmedNewName = newName.trim();
              // Case-insensitive comparison
              const isDuplicate = allSlideNames.some(
                (existingName) =>
                  existingName.toLowerCase() === trimmedNewName.toLowerCase()
              );

              if (isDuplicate) {
                toast.error(
                  `A slide with the name "${trimmedNewName}" already exists in this chapter. Please choose a different name.`
                );
                return false; // Validation failed
              }
              return true; // Validation passed
            };

            // Save function that only runs if validation passes
            const saveSlideName = (newName) => {
              slideName.textContent = newName;

              // Persist into per-chapter name map keyed by page ID
              try {
                const { moduleId, chapterId } = getActiveScopeKeys();
                const pageId = (store.pages || [])[index]?.id;
                if (!pageId) return;
                const map = loadNameMap(moduleId, chapterId);
                map[pageId] = newName;
                saveNameMap(moduleId, chapterId, map);
              } catch (e) {
                console.error("Error saving slide name to name map:", e);
              }
            };

            openSlideNameModal(
              index + 1,
              currentName,
              saveSlideName,
              validateSlideName
            );
          };

          slideName.addEventListener("click", editSlideName);

          // Names already resolved from per-chapter name map above

          // Assemble the container
          slideContainer.appendChild(slideName);

          // Add to page container
          container.style.position = "relative";
          container.appendChild(slideContainer);
        });
      });
    };

    // Run immediately
    addSlideNumbersAndNames();

    // Set up observer to watch for new page thumbnails
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        // Check if new page containers were added
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is a page container or contains page containers
              if (
                node.classList?.contains("polotno-page-container") ||
                node.querySelector?.(".polotno-page-container")
              ) {
                shouldUpdate = true;
              }
            }
          });
        }
      });

      if (shouldUpdate) {
        // Add a small delay to ensure DOM is fully updated
        setTimeout(() => {
          addSlideNumbersAndNames();
        }, 100);
      }
    });

    // Observe the pages timeline container specifically
    const pagesTimelineContainer =
      document.querySelector(".polotno-pages-timeline") || document.body;
    observer.observe(pagesTimelineContainer, {
      childList: true,
      subtree: true,
    });

    // Re-enabled: Store change listener for slide numbering (cross-contamination fixed)
    // The addSlideNumbersAndNames function now only processes the active PagesTimeline
    const unsubscribe = store.on("change", () => {
      // Add a small delay to ensure DOM is updated
      setTimeout(() => {
        addSlideNumbersAndNames();
      }, 50);
    });

    // Function to detect and save slide reordering
    const setupSlideReorderDetection = () => {
      let lastSlideOrder = [];
      let lastIdOrder = [];

      const detectSlideReorder = () => {
        const pagesTimeline = document.querySelector(".polotno-pages-timeline");
        if (!pagesTimeline) return;

        const pageContainers = pagesTimeline.querySelectorAll(
          ".polotno-page-container"
        );
        if (pageContainers.length === 0) return;

        // Build current id order from store
        const currentIdOrder = (store.pages || []).map((p) => p.id);

        // For backward compatibility: derive current names from name map if needed (for debugging only)
        const { moduleId, chapterId } = getActiveScopeKeys();
        const nameMap = loadNameMap(moduleId, chapterId);
        const currentSlideOrder = currentIdOrder.map(
          (id, i) => nameMap[id] || `Slide ${i + 1}`
        );

        // Debug: Log current order every few checks
        if (Math.random() < 0.1) {
          // Log 10% of the time
          console.log("Current slide order:", currentSlideOrder);
        }

        // Check if order has changed (either names or IDs)
        const orderChangedByName = !arraysEqual(
          lastSlideOrder,
          currentSlideOrder
        );
        const orderChangedById = !arraysEqual(lastIdOrder, currentIdOrder);

        if (orderChangedById && lastIdOrder.length > 0) {
          console.log("🎯 SLIDE ORDER CHANGED!");
          console.log("Names from:", lastSlideOrder, "to:", currentSlideOrder);
          console.log("IDs from:", lastIdOrder, "to:", currentIdOrder);
          console.log("modulesData at change detection:", modulesData);

          // Save the new slide ID order to localStorage (names persist per page)
          saveSlideOrder(currentSlideOrder, currentIdOrder);
        }

        lastSlideOrder = [...currentSlideOrder];
        lastIdOrder = [...currentIdOrder];
      };

      // Helper function to compare arrays
      const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        return a.every((val, index) => val === b[index]);
      };

      // Save slide order to localStorage
      const saveSlideOrder = (slideOrder, idOrder) => {
        try {
          console.log("=== SAVE SLIDE ORDER DEBUG ===");
          console.log("modulesData:", modulesData);
          console.log("activeModuleId:", modulesData?.activeModuleId);
          console.log("activeChapterId:", modulesData?.activeChapterId);

          // Use "default" for chapters when there are no chapters, otherwise use the actual chapter ID
          const chapterId = modulesData?.activeChapterId || "default";
          const moduleId = modulesData?.activeModuleId || 1;
          const key = `slide-order-${moduleId}-${chapterId}`;
          const idKey = `slide-id-order-${moduleId}-${chapterId}`;

          console.log("Using keys:", key, idKey);

          // Do not persist name arrays anymore (deprecated), keep id order only
          localStorage.setItem(idKey, JSON.stringify(idOrder || []));

          console.log(
            "Saved slide order (names):",
            slideOrder,
            "and (ids):",
            idOrder,
            "with keys:",
            key,
            idKey
          );
          console.log("=== END SAVE DEBUG ===");
        } catch (e) {
          console.error("Error saving slide order:", e);
        }
      };

      // Set up a periodic check for slide reordering
      const reorderCheckInterval = setInterval(detectSlideReorder, 500);

      return () => {
        clearInterval(reorderCheckInterval);
      };
    };

    // Setup slide reorder detection
    const cleanupReorderDetection = setupSlideReorderDetection();

    return () => {
      observer.disconnect();
      cleanupReorderDetection();
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Specifically target and hide "Pages" text in the pages timeline
  React.useEffect(() => {
    const hidePagesText = () => {
      // Find all PagesTimeline components (there might be multiple in different modules)
      const pagesTimelines = document.querySelectorAll(
        ".polotno-pages-timeline"
      );

      pagesTimelines.forEach((pagesTimeline) => {
        // Hide only elements that contain "Pages" text, not entire navbars or buttons
        const pagesElements = pagesTimeline.querySelectorAll(
          '*[aria-label*="Pages"], *[aria-label*="pages"], ' +
            '*[title*="Pages"], *[title*="pages"]'
        );
        pagesElements.forEach((element) => {
          element.style.display = "none";
          element.style.visibility = "hidden";
        });

        // Hide any text elements that contain "Pages" but preserve buttons and functionality
        const allElements = pagesTimeline.querySelectorAll("*");
        allElements.forEach((element) => {
          // Check if the element itself contains "Pages" text but is not a button
          if (
            element.textContent &&
            element.textContent.trim() === "Pages" &&
            !element.querySelector("svg") && // Don't hide elements with icons (like plus button)
            !element.classList.contains("bp5-button") &&
            !element.classList.contains("bp4-button") &&
            !element.closest("button")
          ) {
            // Don't hide if it's inside a button
            element.style.display = "none";
            element.style.visibility = "hidden";
          }

          // Check all child text nodes
          const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          let textNode;
          while ((textNode = walker.nextNode())) {
            if (
              textNode.textContent &&
              textNode.textContent.trim() === "Pages"
            ) {
              const parent = textNode.parentElement;
              // Only hide if parent is not a button and doesn't contain icons
              if (
                parent &&
                !parent.classList.contains("bp5-button") &&
                !parent.classList.contains("bp4-button") &&
                !parent.closest("button") &&
                !parent.querySelector("svg")
              ) {
                parent.style.display = "none";
                parent.style.visibility = "hidden";
              }
            }
          }
        });
      });
    };

    // Run immediately
    hidePagesText();

    // Set up a more frequent observer to catch the text as soon as it appears
    const observer = new MutationObserver(() => {
      hidePagesText();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Also run periodically as a backup
    const interval = setInterval(hidePagesText, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
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

      // Hide any text containing "Pages" - more comprehensive approach
      const pagesText = document.querySelectorAll(
        '.polotno-pages-timeline *[aria-label*="pages"], ' +
          '.polotno-pages-timeline *[title*="pages"], ' +
          '.polotno-pages-timeline *[aria-label*="Pages"], ' +
          '.polotno-pages-timeline *[title*="Pages"]'
      );
      pagesText.forEach((element) => {
        element.style.display = "none";
        element.style.visibility = "hidden";
      });

      // Also hide any text nodes or elements that contain "Pages" text
      const allElements = document.querySelectorAll(
        ".polotno-pages-timeline *"
      );
      allElements.forEach((element) => {
        if (element.textContent && element.textContent.trim() === "Pages") {
          element.style.display = "none";
          element.style.visibility = "hidden";
        }
        // Also check child text nodes
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        let textNode;
        while ((textNode = walker.nextNode())) {
          if (textNode.textContent && textNode.textContent.trim() === "Pages") {
            textNode.parentElement.style.display = "none";
            textNode.parentElement.style.visibility = "hidden";
          }
        }
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
        toast.error(
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

  // Fix narration input placeholder text
  React.useEffect(() => {
    const fixNarrationInputs = () => {
      console.log("=== Fixing narration inputs ===");

      // Find the Edit Narration modal
      const editModal = Array.from(document.querySelectorAll("*")).find(
        (el) =>
          el.textContent &&
          el.textContent.includes("Edit Narration") &&
          el.tagName === "DIV"
      );

      if (editModal) {
        console.log("Found Edit Narration modal");

        // Find input field in the modal - try multiple selectors
        let modalInput = editModal.querySelector('input[type="text"]');

        if (!modalInput) {
          modalInput = editModal.querySelector(
            'input[placeholder*="Type element name"]'
          );
        }

        if (!modalInput) {
          modalInput = editModal.querySelector("input");
        }

        if (!modalInput) {
          modalInput = editModal.querySelector("textarea");
        }

        console.log("Modal input search result:", modalInput);

        if (modalInput) {
          console.log("Found input in modal:", modalInput);

          // Ensure we only autofill once per modal open
          if (!editModal.__autofilledOnce) {
            let narrationText = "";

            // 1) Prefer active element from Polotno store
            try {
              const store = window?.polotnoStore;
              const active = store?.selectedElements?.[0];
              if (active) {
                // Use name, text, or title if available, otherwise just the ID with #
                narrationText =
                  active.name ||
                  active.text ||
                  active.title ||
                  `#${active.id || ""}`;
                console.log(
                  "Derived narration from store element:",
                  narrationText
                );
              }
            } catch (e) {
              console.log("No store/selected element available", e);
            }

            // 2) Fallback: derive from Layers pane DOM (more permissive)
            if (!narrationText) {
              const narrationsSection = Array.from(
                document.querySelectorAll("*")
              ).find(
                (el) =>
                  el.textContent &&
                  el.textContent.includes("Narrations on your active page") &&
                  el.tagName === "DIV"
              );

              if (narrationsSection) {
                const candidates = Array.from(
                  narrationsSection.querySelectorAll(
                    ".bp5-menu-item, [role='menuitem'], span, div"
                  )
                )
                  .map((n) => n.textContent?.trim())
                  .filter(
                    (t) =>
                      t &&
                      t !== "Type element name..." &&
                      t.length > 0 &&
                      t.length < 120 &&
                      !/^\d+%$/.test(t) &&
                      !/^\d+$/.test(t)
                  );
                if (candidates.length) {
                  // Remove type prefixes like "Image #", "Text #", etc.
                  let text = candidates[0];
                  text = text.replace(
                    /^(Image|Text|Element|Shape|Group)\s*#/,
                    "#"
                  );
                  narrationText = text;
                  console.log(
                    "Derived narration from DOM candidates:",
                    narrationText
                  );
                }
              } else {
                console.log("Narrations section not found");
              }
            }

            // 3) Apply to modal input and dispatch events so React updates
            if (narrationText) {
              const setValue = Object.getOwnPropertyDescriptor(
                Object.getPrototypeOf(modalInput),
                "value"
              )?.set;
              if (setValue) {
                setValue.call(modalInput, narrationText);
              } else {
                modalInput.value = narrationText;
              }
              modalInput.placeholder = narrationText;
              modalInput.dispatchEvent(new Event("input", { bubbles: true }));
              modalInput.dispatchEvent(new Event("change", { bubbles: true }));
              editModal.__autofilledOnce = true;
              console.log("Set modal input to:", narrationText);
            } else {
              console.log("No narration text derived to fill modal");
            }
          }
        } else {
          console.log("No input found in modal");
        }
      } else {
        console.log("Edit Narration modal not found");
      }
    };

    // Run immediately
    fixNarrationInputs();

    // Set up observer to watch for new input fields
    const observer = new MutationObserver(() => {
      fixNarrationInputs();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also run periodically as fallback (more frequent for modal detection)
    const interval = setInterval(fixNarrationInputs, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* React Hot Toast Toaster */}
      <Toaster position="top-right" />

      {/* Hierarchical Pages Navigation - Top Left Position */}
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "200px",
          height: "100vh",
          zIndex: "1000",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
        }}
      >
        <HierarchicalPagesNavigation
          store={store}
          onModulesChange={handleModulesChange}
        />
      </div>

      <PolotnoContainer
        style={{
          width: "calc(100vw - 200px)",
          height: "100vh",
          marginLeft: "200px",
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
            <CustomDownloadButton
              store={store}
              modules={modulesData?.modules || []}
              chapterPagesRef={modulesData?.chapterPagesRef}
              activeModuleId={modulesData?.activeModuleId}
              activeChapterId={modulesData?.activeChapterId}
            />
            <CustomCreateButton store={store} />
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
