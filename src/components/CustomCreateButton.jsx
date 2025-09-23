import React from "react";
import { Video } from "@blueprintjs/icons";
import HTML5VideoPlayer from "./HTML5VideoPlayer";
import { Button } from "@blueprintjs/core";
import { toast } from "react-hot-toast";

const CustomCreateButton = () => {
  const [hasNarrations, setHasNarrations] = React.useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = React.useState(false);

  // Check for narrations in the Layers tab
  React.useEffect(() => {
    const checkForNarrations = () => {
      try {
        console.log("=== Checking for narrations ===");

        // Look for the "Narrations on your active page" section more specifically
        const narrationsSection = Array.from(
          document.querySelectorAll("div, span, p")
        ).find(
          (el) =>
            el.textContent &&
            el.textContent.includes("Narrations on your active page") &&
            el.textContent.length < 1000 // Avoid selecting the entire document
        );

        console.log("Narrations section found:", !!narrationsSection);
        if (!narrationsSection) {
          console.log("No narrations section found, disabling button");
          setHasNarrations(false);
          return;
        }

        // Debug: Log the narrations section HTML structure (only if found)
        if (narrationsSection) {
          console.log("Narrations section found, checking for items...");
        }

        // Find all menu items within that section
        const allMenuItems = Array.from(
          narrationsSection.querySelectorAll(".bp5-menu-item")
        );
        console.log("All menu items in section:", allMenuItems.length);

        allMenuItems.forEach((item, index) => {
          const text = item.textContent?.trim();
          console.log(`Item ${index}:`, text);
        });

        // Find narration items within that section
        const narrationItems = allMenuItems.filter((item) => {
          const text = item.textContent?.trim();
          // Only consider items that are actual narrations (not UI labels)
          const isNarration =
            text &&
            text.length > 0 &&
            text.length < 100 && // Reasonable length for narration
            !text.includes("Add") &&
            !text.includes("Module") &&
            !text.includes("Chapter") &&
            !text.includes("Download") &&
            !text.includes("Create") &&
            !text.includes("Upload") &&
            !text.includes("Background") &&
            !text.includes("Layers") &&
            !text.includes("Resize") &&
            !text.includes("Templates") &&
            !text.includes("Photos") &&
            !text.includes("Avatar") &&
            !text.includes("Elements") &&
            !text.includes("Position") &&
            !text.includes("Narrations on your active page") &&
            text !== "Text" &&
            text !== "Image" &&
            !text.match(/^Text\s*$/) &&
            !text.match(/^Image\s*$/) &&
            !text.includes("No Narrations") &&
            !text.includes("No narrations");

          if (isNarration) {
            console.log("Found narration:", text);
          }

          return isNarration;
        });

        console.log("Found narration items:", narrationItems.length);
        if (narrationItems.length > 0) {
          console.log(
            "Narration items found:",
            narrationItems.map((item) => item.textContent?.trim())
          );
        }

        // If no narrations found with the first method, try alternative selectors
        if (narrationItems.length === 0) {
          console.log("Trying alternative selectors...");

          // Try different selectors for narration items
          const alternativeSelectors = [
            "span", // The actual narration text elements
            "div span", // Nested spans
            ".bp5-menu-item",
            '[role="menuitem"]',
            ".bp5-menu-item span",
            ".bp5-menu-item div",
            ".polotno-element-item",
          ];

          let foundItems = [];
          for (const selector of alternativeSelectors) {
            const items = Array.from(document.querySelectorAll(selector));
            const narrations = items.filter((item) => {
              const text = item.textContent?.trim();
              // Much more strict filtering to exclude UI elements
              return (
                text &&
                text.length > 0 &&
                text.length < 100 && // Reasonable length for narration text
                text.length > 3 && // At least 4 characters (excludes "▼", "51%", etc.)
                !text.includes("Add") &&
                !text.includes("Module") &&
                !text.includes("Chapter") &&
                !text.includes("Download") &&
                !text.includes("Create") &&
                !text.includes("Upload") &&
                !text.includes("Background") &&
                !text.includes("Layers") &&
                !text.includes("Resize") &&
                !text.includes("Templates") &&
                !text.includes("Photos") &&
                !text.includes("Avatar") &&
                !text.includes("Elements") &&
                !text.includes("Position") &&
                !text.includes("Narrations on your active page") &&
                !text.includes("No Narrations") &&
                !text.includes("No narrations") &&
                text !== "Text" &&
                text !== "Image" &&
                text !== "▼" && // Exclude dropdown arrows
                text !== "Pages" && // Exclude "Pages" text
                !text.match(/^\d+%$/) && // Exclude percentage like "51%"
                !text.match(/^Text\s*$/) &&
                !text.match(/^Image\s*$/) &&
                !text.match(/^[▼▲◀▶]$/) && // Exclude all arrow symbols
                !text.match(/^\d+$/) && // Exclude pure numbers
                !text.match(/^[A-Za-z]{1,3}$/) // Exclude short words like "Pages"
              );
            });

            if (narrations.length > 0) {
              console.log(
                `Found ${narrations.length} narrations with selector: ${selector}`
              );
              foundItems = narrations;
              break;
            }
          }

          console.log(
            "Alternative method found:",
            foundItems.length,
            "narrations"
          );
          if (foundItems.length > 0) {
            console.log(
              "Alternative narrations found:",
              foundItems.map((item) => item.textContent?.trim())
            );
          }
          setHasNarrations(foundItems.length > 0);
        } else {
          console.log("Setting hasNarrations to:", narrationItems.length > 0);
          setHasNarrations(narrationItems.length > 0);
        }
      } catch (error) {
        console.error("Error checking for narrations:", error);
        setHasNarrations(false);
      }
    };

    // Check immediately
    checkForNarrations();

    // Set up observer to watch for changes in the Layers tab
    const observer = new MutationObserver(() => {
      checkForNarrations();
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Also check periodically as a fallback (less frequent to avoid infinite loops)
    const interval = setInterval(checkForNarrations, 3000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleCreateVideo = () => {
    if (!hasNarrations) {
      toast.error(
        "No narrations found in the Layers tab. Add some narrations first!"
      );
      return;
    }

    console.log("Creating video for narrations...");
    setShowVideoPlayer(true);
  };

  return (
    <>
      <Button
        icon={<Video />}
        text="Create Video"
        intent="primary"
        onClick={handleCreateVideo}
        disabled={!hasNarrations}
        style={{
          marginLeft: "12px",
          whiteSpace: "nowrap",
          minWidth: "150px",
          opacity: hasNarrations ? 1 : 0.5,
        }}
      />
      <HTML5VideoPlayer
        isOpen={showVideoPlayer}
        onClose={() => setShowVideoPlayer(false)}
      />
    </>
  );
};

export default CustomCreateButton;
