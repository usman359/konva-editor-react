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
  Dialog,
  InputGroup,
} from "@blueprintjs/core";
import { Download, Plus, FolderOpen, Edit } from "@blueprintjs/icons";
import { saveAs } from "file-saver";

import "@blueprintjs/core/lib/css/blueprint.css";

import { createStore } from "polotno/model/store";

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
    margin: 0 auto !important;
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

// Custom Hierarchical Pages Navigation Component
const HierarchicalPagesNavigation = ({ store }) => {
  const [modules, setModules] = React.useState([
    {
      id: 1,
      name: "Module 1",
      chapters: [
        {
          id: 1,
          name: "Chapter 1",
          pages: [],
          isExpanded: true,
        },
      ],
      isExpanded: true,
    },
  ]);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [createType, setCreateType] = React.useState("module");
  const [newItemName, setNewItemName] = React.useState("");
  const [activeModuleId, setActiveModuleId] = React.useState(1);
  const [activeChapterId, setActiveChapterId] = React.useState(1);
  const [editingModuleId, setEditingModuleId] = React.useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [moduleToDelete, setModuleToDelete] = React.useState(null);
  const [showChapterOption, setShowChapterOption] = React.useState(false);
  const [chapterName, setChapterName] = React.useState("");
  const [editingChapterId, setEditingChapterId] = React.useState(null);
  const [chapterToDelete, setChapterToDelete] = React.useState(null);
  const [deleteChapterModalOpen, setDeleteChapterModalOpen] =
    React.useState(false);
  const [editChapterModalOpen, setEditChapterModalOpen] = React.useState(false);
  // Per-module pages snapshots while keeping ONE Polotno store for default behavior
  const modulePagesRef = React.useRef({});
  // Per-chapter pages snapshots - using moduleId-chapterId as key
  const chapterPagesRef = React.useRef({});

  const handleCreateClick = () => {
    setEditingModuleId(null);
    setCreateType("module");
    setIsCreateModalOpen(true);
  };

  const handleCreateChapterClick = (moduleId) => {
    setCreateType("chapter");
    setActiveModuleId(moduleId); // Set the target module ID
    setIsCreateModalOpen(true);
  };

  // Helper function to get chapter key
  const getChapterKey = (moduleId, chapterId) => `${moduleId}-${chapterId}`;

  // Helper function to load chapter pages
  const loadChapterPages = (moduleId, chapterId) => {
    try {
      const chapterKey = getChapterKey(moduleId, chapterId);
      const pages = chapterPagesRef.current[chapterKey] || [];
      const base = store.toJSON();
      store.loadJSON({ ...base, pages });
    } catch (e) {
      console.error("Error loading chapter pages:", e);
    }
  };

  const handleEditModule = (moduleId) => {
    const module = modules.find((m) => m.id === moduleId);
    if (module) {
      setEditingModuleId(moduleId);
      setNewItemName(module.name);
      setIsCreateModalOpen(true);
    }
  };

  const handleDeleteModule = (moduleId) => {
    if (modules.length <= 1) {
      alert("Cannot delete the last module. At least one module must exist.");
      return;
    }

    // Open custom delete confirmation modal
    setModuleToDelete(moduleId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteModule = () => {
    if (!moduleToDelete) return;

    // Save current module pages before deletion
    try {
      const current = store.toJSON();
      modulePagesRef.current[activeModuleId] = current.pages || [];
      localStorage.setItem(
        "polotno-demo-module-pages",
        JSON.stringify(modulePagesRef.current)
      );
    } catch (e) {}

    // Remove module from state
    const updatedModules = modules.filter((m) => m.id !== moduleToDelete);
    setModules(updatedModules);

    // If we're deleting the active module, switch to the first remaining module
    if (activeModuleId === moduleToDelete) {
      const newActiveModule = updatedModules[0];
      setActiveModuleId(newActiveModule.id);

      // Load the new active module's pages
      try {
        const base = store.toJSON();
        const pages = modulePagesRef.current[newActiveModule.id] || [];
        store.loadJSON({ ...base, pages });
      } catch (e) {}
    }

    // Clean up module pages from localStorage
    try {
      delete modulePagesRef.current[moduleToDelete];
      localStorage.setItem(
        "polotno-demo-module-pages",
        JSON.stringify(modulePagesRef.current)
      );
    } catch (e) {}

    // Close modal and reset state
    setDeleteModalOpen(false);
    setModuleToDelete(null);
  };

  const cancelDeleteModule = () => {
    setDeleteModalOpen(false);
    setModuleToDelete(null);
  };

  const handleEditChapter = (moduleId, chapterId) => {
    const module = modules.find((m) => m.id === moduleId);
    const chapter = module?.chapters?.find((c) => c.id === chapterId);
    if (chapter) {
      setEditingChapterId(chapterId);
      setChapterName(chapter.name);
      setEditChapterModalOpen(true);
    }
  };

  const handleDeleteChapter = (moduleId, chapterId) => {
    const module = modules.find((m) => m.id === moduleId);
    if (module?.chapters?.length <= 1) {
      alert("Cannot delete the last chapter. At least one chapter must exist.");
      return;
    }
    setChapterToDelete({ moduleId, chapterId });
    setDeleteChapterModalOpen(true);
  };

  const confirmDeleteChapter = () => {
    if (!chapterToDelete) return;

    const { moduleId, chapterId } = chapterToDelete;

    // Clean up chapter pages from ref and localStorage
    try {
      const chapterKey = getChapterKey(moduleId, chapterId);
      delete chapterPagesRef.current[chapterKey];
      localStorage.setItem(
        "polotno-demo-chapter-pages",
        JSON.stringify(chapterPagesRef.current)
      );
    } catch (e) {
      console.error("Error cleaning up chapter pages:", e);
    }

    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              chapters: module.chapters.filter((c) => c.id !== chapterId),
            }
          : module
      )
    );

    setDeleteChapterModalOpen(false);
    setChapterToDelete(null);
  };

  const cancelDeleteChapter = () => {
    setDeleteChapterModalOpen(false);
    setChapterToDelete(null);
  };

  const handleSaveChapter = () => {
    if (!chapterName.trim() || !editingChapterId) return;

    setModules(
      modules.map((module) =>
        module.id === activeModuleId
          ? {
              ...module,
              chapters: module.chapters.map((chapter) =>
                chapter.id === editingChapterId
                  ? { ...chapter, name: chapterName.trim() }
                  : chapter
              ),
            }
          : module
      )
    );

    setChapterName("");
    setEditingChapterId(null);
    setEditChapterModalOpen(false);
  };

  const toggleChapter = (moduleId, chapterId) => {
    const module = modules.find((m) => m.id === moduleId);
    const chapter = module?.chapters?.find((c) => c.id === chapterId);
    const isCurrentlyExpanded = chapter?.isExpanded || false;

    // Save current chapter pages before switching
    if (moduleId === activeModuleId) {
      try {
        const current = store.toJSON();
        const currentChapterKey = getChapterKey(
          activeModuleId,
          activeChapterId
        );
        chapterPagesRef.current[currentChapterKey] = current.pages || [];
        localStorage.setItem(
          "polotno-demo-chapter-pages",
          JSON.stringify(chapterPagesRef.current)
        );
      } catch (e) {
        console.error("Error saving current chapter pages:", e);
      }
    }

    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              chapters: module.chapters.map((chapter) =>
                chapter.id === chapterId
                  ? { ...chapter, isExpanded: !chapter.isExpanded }
                  : chapter
              ),
            }
          : module
      )
    );

    // If expanding a chapter, load its pages or start fresh
    if (!isCurrentlyExpanded && moduleId === activeModuleId) {
      setActiveChapterId(chapterId);
      loadChapterPages(moduleId, chapterId);
    }
  };

  const handleCreateItem = () => {
    if (!newItemName.trim()) return;

    if (createType === "module") {
      if (editingModuleId) {
        // Editing existing module
        setModules(
          modules.map((module) =>
            module.id === editingModuleId
              ? { ...module, name: newItemName.trim() }
              : module
          )
        );
        setEditingModuleId(null);
      } else {
        // Creating new module
        // Save current module pages before switching
        try {
          const current = store.toJSON();
          modulePagesRef.current[activeModuleId] = current.pages || [];
          // Trigger localStorage save for module pages
          localStorage.setItem(
            "polotno-demo-module-pages",
            JSON.stringify(modulePagesRef.current)
          );
        } catch (e) {}

        const newModule = {
          id: Date.now(),
          name: newItemName.trim(),
          chapters: showChapterOption
            ? [
                {
                  id: Date.now() + 1,
                  name: chapterName.trim() || "Chapter 1",
                  pages: [],
                  isExpanded: true,
                },
              ]
            : [],
          isExpanded: true,
        };

        setModules([...modules, newModule]);
        // Switch to the new module and start with empty pages
        setActiveModuleId(newModule.id);
        try {
          const base = store.toJSON();
          store.loadJSON({ ...base, pages: [] });
        } catch (e) {}
      }
    } else if (createType === "chapter") {
      // Save current chapter pages before creating new one (if we're switching modules)
      try {
        const current = store.toJSON();
        const currentChapterKey = getChapterKey(
          activeModuleId,
          activeChapterId
        );
        chapterPagesRef.current[currentChapterKey] = current.pages || [];
        localStorage.setItem(
          "polotno-demo-chapter-pages",
          JSON.stringify(chapterPagesRef.current)
        );
      } catch (e) {
        console.error("Error saving current chapter pages:", e);
      }

      // Creating new chapter
      const newChapter = {
        id: Date.now(),
        name: newItemName.trim(),
        pages: [],
        isExpanded: true,
      };

      setModules(
        modules.map((module) =>
          module.id === activeModuleId
            ? {
                ...module,
                chapters: [...module.chapters, newChapter],
              }
            : module
        )
      );

      // Set new chapter as active and start with empty pages
      setActiveChapterId(newChapter.id);

      // Initialize empty pages for the new chapter
      const chapterKey = getChapterKey(activeModuleId, newChapter.id);
      chapterPagesRef.current[chapterKey] = [];

      try {
        const base = store.toJSON();
        store.loadJSON({ ...base, pages: [] });
      } catch (e) {
        console.error("Error clearing store for new chapter:", e);
      }
    }

    setNewItemName("");
    setChapterName("");
    setShowChapterOption(false);
    setIsCreateModalOpen(false);
  };

  const toggleModule = (moduleId) => {
    const isCurrentlyExpanded =
      modules.find((m) => m.id === moduleId)?.isExpanded || false;

    // Save current chapter pages before switching modules
    if (activeModuleId !== moduleId) {
      try {
        const current = store.toJSON();
        const currentChapterKey = getChapterKey(
          activeModuleId,
          activeChapterId
        );
        chapterPagesRef.current[currentChapterKey] = current.pages || [];
        localStorage.setItem(
          "polotno-demo-chapter-pages",
          JSON.stringify(chapterPagesRef.current)
        );
      } catch (e) {
        console.error("Error saving current chapter pages:", e);
      }
    }

    // Save current module pages
    try {
      const current = store.toJSON();
      modulePagesRef.current[activeModuleId] = current.pages || [];
      // Trigger localStorage save for module pages
      localStorage.setItem(
        "polotno-demo-module-pages",
        JSON.stringify(modulePagesRef.current)
      );
    } catch (e) {}

    // If the module is collapsed, expand it and collapse all others
    // If the module is expanded, just collapse it
    if (!isCurrentlyExpanded) {
      // Module is collapsed - expand it, collapse all others, and make it active
      setModules(
        modules.map((module) =>
          module.id === moduleId
            ? { ...module, isExpanded: true }
            : { ...module, isExpanded: false }
        )
      );
      setActiveModuleId(moduleId);

      // Set the first chapter as active and load its pages
      const newModule = modules.find((m) => m.id === moduleId);
      if (newModule && newModule.chapters && newModule.chapters.length > 0) {
        const firstChapter = newModule.chapters[0];
        setActiveChapterId(firstChapter.id);
        loadChapterPages(moduleId, firstChapter.id);
      } else {
        // No chapters, load module pages
        try {
          const base = store.toJSON();
          const pages = modulePagesRef.current[moduleId] || [];
          store.loadJSON({ ...base, pages });
        } catch (e) {}
      }
    } else {
      // Module is expanded - just collapse it
      setModules(
        modules.map((module) =>
          module.id === moduleId ? { ...module, isExpanded: false } : module
        )
      );
    }

    // Hide Pages text after module expansion
    setTimeout(() => {
      const pagesTimelines = document.querySelectorAll(
        ".polotno-pages-timeline"
      );
      pagesTimelines.forEach((timeline) => {
        // Only hide elements that contain "Pages" text, preserve buttons and functionality
        const allElements = timeline.querySelectorAll("*");
        allElements.forEach((element) => {
          // Check if the element contains only "Pages" text (not buttons with icons)
          if (
            element.textContent &&
            element.textContent.trim() === "Pages" &&
            !element.querySelector("svg") && // Don't hide elements with icons (like plus button)
            !element.classList.contains("bp5-button") &&
            !element.classList.contains("bp4-button")
          ) {
            element.style.display = "none";
            element.style.visibility = "hidden";
          }
        });
      });
    }, 100);
  };

  // Load modules from localStorage on mount
  React.useEffect(() => {
    try {
      const savedModules = localStorage.getItem("polotno-demo-modules");
      const savedModulePages = localStorage.getItem(
        "polotno-demo-module-pages"
      );
      const savedChapterPages = localStorage.getItem(
        "polotno-demo-chapter-pages"
      );
      const savedActiveModuleId = localStorage.getItem(
        "polotno-demo-active-module-id"
      );
      const savedActiveChapterId = localStorage.getItem(
        "polotno-demo-active-chapter-id"
      );

      if (savedModules) {
        const parsedModules = JSON.parse(savedModules);
        setModules(parsedModules);
        console.log("Loaded modules from localStorage:", parsedModules);
      }

      if (savedModulePages) {
        const parsedModulePages = JSON.parse(savedModulePages);
        modulePagesRef.current = parsedModulePages;
        console.log(
          "Loaded module pages from localStorage:",
          parsedModulePages
        );
      }

      if (savedChapterPages) {
        const parsedChapterPages = JSON.parse(savedChapterPages);
        chapterPagesRef.current = parsedChapterPages;
        console.log(
          "Loaded chapter pages from localStorage:",
          parsedChapterPages
        );
      }

      if (savedActiveModuleId) {
        const parsedActiveModuleId = parseInt(savedActiveModuleId);
        setActiveModuleId(parsedActiveModuleId);
        console.log(
          "Loaded active module ID from localStorage:",
          parsedActiveModuleId
        );
      }

      if (savedActiveChapterId) {
        const parsedActiveChapterId = parseInt(savedActiveChapterId);
        setActiveChapterId(parsedActiveChapterId);
        console.log(
          "Loaded active chapter ID from localStorage:",
          parsedActiveChapterId
        );
      }
    } catch (error) {
      console.error("Error loading modules from localStorage:", error);
    }
  }, []);

  // Save modules to localStorage whenever modules change
  React.useEffect(() => {
    try {
      localStorage.setItem("polotno-demo-modules", JSON.stringify(modules));
      console.log("Saved modules to localStorage:", modules);
    } catch (error) {
      console.error("Error saving modules to localStorage:", error);
    }
  }, [modules]);

  // Save active module ID to localStorage whenever it changes
  React.useEffect(() => {
    try {
      localStorage.setItem(
        "polotno-demo-active-module-id",
        activeModuleId.toString()
      );
      console.log("Saved active module ID to localStorage:", activeModuleId);
    } catch (error) {
      console.error("Error saving active module ID to localStorage:", error);
    }
  }, [activeModuleId]);

  // Save active chapter ID to localStorage whenever it changes
  React.useEffect(() => {
    try {
      localStorage.setItem(
        "polotno-demo-active-chapter-id",
        activeChapterId.toString()
      );
      console.log("Saved active chapter ID to localStorage:", activeChapterId);
    } catch (error) {
      console.error("Error saving active chapter ID to localStorage:", error);
    }
  }, [activeChapterId]);

  // Save module pages to localStorage whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem(
        "polotno-demo-module-pages",
        JSON.stringify(modulePagesRef.current)
      );
      console.log(
        "Saved module pages to localStorage:",
        modulePagesRef.current
      );
    } catch (error) {
      console.error("Error saving module pages to localStorage:", error);
    }
  }, [modulePagesRef.current]);

  // Save chapter pages to localStorage whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem(
        "polotno-demo-chapter-pages",
        JSON.stringify(chapterPagesRef.current)
      );
      console.log(
        "Saved chapter pages to localStorage:",
        chapterPagesRef.current
      );
    } catch (error) {
      console.error("Error saving chapter pages to localStorage:", error);
    }
  }, [chapterPagesRef.current]);

  // Note: Removed all automatic saving via useEffect
  // This was causing cross-module contamination. Page saving now only happens
  // during explicit module/chapter switching operations using refs.

  // Initialize snapshot for the first module on mount
  React.useEffect(() => {
    try {
      const json = store.toJSON();
      if (!modulePagesRef.current[activeModuleId]) {
        modulePagesRef.current[activeModuleId] = json.pages || [];
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize snapshot for the first chapter on mount
  React.useEffect(() => {
    try {
      const json = store.toJSON();
      const chapterKey = getChapterKey(activeModuleId, activeChapterId);
      if (!chapterPagesRef.current[chapterKey]) {
        chapterPagesRef.current[chapterKey] = json.pages || [];
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "10px 5px",
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
      }}
    >
      {/* Module Headers */}
      {modules.map((module) => (
        <div key={module.id} style={{ marginBottom: "10px" }}>
          {/* Module Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              backgroundColor: module.isExpanded ? "#e1e5e9" : "#f5f5f5",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "5px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#333",
              minWidth: 0, // Allow flex item to shrink
            }}
            onClick={() => toggleModule(module.id)}
          >
            <FolderOpen
              size={12}
              style={{ marginRight: "6px", flexShrink: 0 }}
            />
            <span
              style={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={module.name} // Show full name on hover
            >
              {module.name}
            </span>
            <span
              style={{ marginLeft: "6px", fontSize: "12px", flexShrink: 0 }}
            >
              {module.isExpanded ? "▼" : "▶"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditModule(module.id);
              }}
              style={{
                marginLeft: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#666",
                fontSize: "12px",
                padding: "2px",
                borderRadius: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "16px",
                height: "16px",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#e1e5e9";
                e.target.style.color = "#333";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#666";
              }}
              title="Edit module"
            >
              <Edit size={10} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteModule(module.id);
              }}
              style={{
                marginLeft: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#666",
                fontSize: "12px",
                padding: "2px",
                borderRadius: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "16px",
                height: "16px",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#ff6b6b";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#666";
              }}
              title="Delete module"
            >
              ×
            </button>
          </div>

          {/* Chapters and Pages under this module */}
          {module.isExpanded && (
            <div style={{ marginLeft: "10px" }}>
              {module.chapters && module.chapters.length > 0
                ? // Show chapters if they exist
                  module.chapters.map((chapter) => (
                    <div key={chapter.id} style={{ marginBottom: "8px" }}>
                      {/* Chapter Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "6px 10px",
                          backgroundColor: chapter.isExpanded
                            ? "#f8f9fa"
                            : "#e9ecef",
                          borderRadius: "3px",
                          cursor: "pointer",
                          marginBottom: "3px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          color: "#333",
                          minWidth: 0,
                        }}
                        onClick={() => toggleChapter(module.id, chapter.id)}
                      >
                        <FolderOpen
                          size={10}
                          style={{ marginRight: "4px", flexShrink: 0 }}
                        />
                        <span
                          style={{
                            flex: 1,
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={chapter.name}
                        >
                          {chapter.name}
                        </span>
                        <span
                          style={{
                            marginLeft: "4px",
                            fontSize: "9px",
                            flexShrink: 0,
                          }}
                        >
                          {chapter.isExpanded ? "▼" : "▶"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditChapter(module.id, chapter.id);
                          }}
                          style={{
                            marginLeft: "4px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#666",
                            fontSize: "10px",
                            padding: "1px",
                            borderRadius: "2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "14px",
                            height: "14px",
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#e9ecef";
                            e.target.style.color = "#333";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = "#666";
                          }}
                          title="Edit chapter"
                        >
                          <Edit size={8} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChapter(module.id, chapter.id);
                          }}
                          style={{
                            marginLeft: "4px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#666",
                            fontSize: "10px",
                            padding: "1px",
                            borderRadius: "2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "14px",
                            height: "14px",
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#ff6b6b";
                            e.target.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = "#666";
                          }}
                          title="Delete chapter"
                        >
                          ×
                        </button>
                      </div>

                      {/* Pages under this chapter - render default PagesTimeline ONLY for active module and expanded chapter */}
                      {chapter.isExpanded && module.id === activeModuleId && (
                        <div style={{ marginLeft: "10px" }}>
                          <div
                            style={{
                              overflow: "hidden",
                              position: "relative",
                            }}
                          >
                            <PagesTimeline store={store} defaultOpened={true} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                : // Show pages directly if no chapters
                  module.id === activeModuleId && (
                    <div
                      style={{
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <PagesTimeline store={store} defaultOpened={true} />
                    </div>
                  )}

              {/* Add Chapter Button - only show if module is expanded */}
              <div
                style={{
                  textAlign: "center",
                  width: "100%",
                  padding: "8px 0",
                }}
              >
                <Button
                  icon={<Plus />}
                  minimal
                  data-chapter-button="true"
                  style={{
                    width: "90px",
                    height: "26px",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onClick={() => handleCreateChapterClick(module.id)}
                >
                  Add Chapter
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Module Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          padding: "10px 0",
        }}
      >
        <Button
          icon={<Plus />}
          minimal
          data-module-button="true"
          style={{
            width: "100px",
            height: "30px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={handleCreateClick}
        >
          Add Module
        </Button>
      </div>

      {/* Create/Edit Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingModuleId(null);
          setEditingChapterId(null);
          setNewItemName("");
          setChapterName("");
          setShowChapterOption(false);
        }}
        title={
          editingModuleId
            ? "Edit Module"
            : createType === "module"
            ? "Create New Module"
            : "Create New Chapter"
        }
        style={{ width: "400px" }}
      >
        <div style={{ padding: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              {createType === "module"
                ? "Module"
                : createType === "chapter"
                ? "Chapter"
                : "Slide"}{" "}
              Name:
            </label>
            <InputGroup
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`Enter ${createType} name...`}
              onKeyPress={(e) => e.key === "Enter" && handleCreateItem()}
            />
          </div>

          {/* Chapter option for new modules */}
          {createType === "module" && !editingModuleId && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: "bold",
                }}
              >
                Do you want chapters for this module?
              </label>
              <div
                style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
              >
                <Button
                  text="Yes"
                  intent={showChapterOption ? "primary" : "none"}
                  onClick={() => setShowChapterOption(true)}
                  small
                />
                <Button
                  text="No"
                  intent={!showChapterOption ? "primary" : "none"}
                  onClick={() => setShowChapterOption(false)}
                  small
                />
              </div>
              {showChapterOption && (
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Chapter Name:
                  </label>
                  <InputGroup
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    placeholder="Enter chapter name..."
                  />
                </div>
              )}
            </div>
          )}

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <Button
              text="Cancel"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingModuleId(null);
                setEditingChapterId(null);
                setNewItemName("");
                setChapterName("");
                setShowChapterOption(false);
              }}
            />
            <Button
              text={editingModuleId ? "Save Changes" : "Create"}
              intent="primary"
              onClick={handleCreateItem}
              disabled={!newItemName.trim()}
            />
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={deleteModalOpen}
        onClose={cancelDeleteModule}
        title="Delete Module"
        style={{ width: "400px" }}
      >
        <div style={{ padding: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>
              Are you sure you want to delete this module? This action cannot be
              undone.
            </p>
            {moduleToDelete && (
              <p
                style={{
                  margin: "10px 0 0 0",
                  fontSize: "12px",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                Module: "{modules.find((m) => m.id === moduleToDelete)?.name}"
              </p>
            )}
          </div>

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <Button text="Cancel" onClick={cancelDeleteModule} />
            <Button
              text="Delete"
              intent="danger"
              onClick={confirmDeleteModule}
            />
          </div>
        </div>
      </Dialog>

      {/* Delete Chapter Confirmation Modal */}
      <Dialog
        isOpen={deleteChapterModalOpen}
        onClose={cancelDeleteChapter}
        title="Delete Chapter"
        style={{ width: "400px" }}
      >
        <div style={{ padding: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>
              Are you sure you want to delete this chapter? This action cannot
              be undone.
            </p>
            {chapterToDelete && (
              <p
                style={{
                  margin: "10px 0 0 0",
                  fontSize: "12px",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                Chapter: "
                {
                  modules
                    .find((m) => m.id === chapterToDelete.moduleId)
                    ?.chapters?.find((c) => c.id === chapterToDelete.chapterId)
                    ?.name
                }
                "
              </p>
            )}
          </div>

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <Button text="Cancel" onClick={cancelDeleteChapter} />
            <Button
              text="Delete"
              intent="danger"
              onClick={confirmDeleteChapter}
            />
          </div>
        </div>
      </Dialog>

      {/* Edit Chapter Modal */}
      <Dialog
        isOpen={editChapterModalOpen}
        onClose={() => {
          setEditChapterModalOpen(false);
          setEditingChapterId(null);
          setChapterName("");
        }}
        title="Edit Chapter"
        style={{ width: "400px" }}
      >
        <div style={{ padding: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Chapter Name:
            </label>
            <InputGroup
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              placeholder="Enter chapter name..."
              onKeyPress={(e) => e.key === "Enter" && handleSaveChapter()}
            />
          </div>

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <Button
              text="Cancel"
              onClick={() => {
                setEditChapterModalOpen(false);
                setEditingChapterId(null);
                setChapterName("");
              }}
            />
            <Button
              text="Save Changes"
              intent="primary"
              onClick={handleSaveChapter}
              disabled={!chapterName.trim()}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

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
  const openSlideNameModal = (slideNumber, currentName, onSave) => {
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
    const addSlideNumbersAndNames = () => {
      // Find all PagesTimeline components
      const pagesTimelines = document.querySelectorAll(
        ".polotno-pages-timeline"
      );

      pagesTimelines.forEach((timeline) => {
        // Find page containers
        const pageContainers = timeline.querySelectorAll(
          ".polotno-page-container"
        );

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
          slideName.textContent = `Slide ${index + 1}`;
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
            openSlideNameModal(index + 1, currentName, (newName) => {
              slideName.textContent = newName;

              // Save to localStorage
              try {
                const savedNames = JSON.parse(
                  localStorage.getItem("polotno-demo-page-names") || "{}"
                );
                savedNames[`slide-${index}`] = newName;
                localStorage.setItem(
                  "polotno-demo-page-names",
                  JSON.stringify(savedNames)
                );
              } catch (e) {
                console.error("Error saving slide name:", e);
              }
            });
          };

          slideName.addEventListener("click", editSlideName);

          // Load saved name from localStorage
          try {
            const savedNames = JSON.parse(
              localStorage.getItem("polotno-demo-page-names") || "{}"
            );
            const savedName = savedNames[`slide-${index}`];
            if (savedName) {
              slideName.textContent = savedName;
            }
          } catch (e) {
            console.error("Error loading slide name:", e);
          }

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

    // Also listen to store changes for immediate updates
    const unsubscribe = store.on("change", () => {
      // Add a small delay to ensure DOM is updated
      setTimeout(() => {
        addSlideNumbersAndNames();
      }, 50);
    });

    return () => {
      observer.disconnect();
      unsubscribe();
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
        <HierarchicalPagesNavigation store={store} />
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
