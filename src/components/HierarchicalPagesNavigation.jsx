import React from "react";
import { Plus, FolderOpen, Edit } from "@blueprintjs/icons";
import { PagesTimeline } from "polotno/pages-timeline";
import { Button, Dialog, InputGroup } from "@blueprintjs/core";
import { toast } from "react-hot-toast";

// Custom Hierarchical Pages Navigation Component
const HierarchicalPagesNavigation = ({ store, onModulesChange }) => {
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

      console.log(
        "Loading pages for chapter:",
        chapterKey,
        "stored pages:",
        pages.length
      );

      // Create a completely clean store state
      const cleanBase = {
        pages: pages,
        width: 800,
        height: 600,
        // Add any other required Polotno store properties
        selectedElements: [],
        history: [],
        clipboard: null,
        settings: {
          width: 800,
          height: 600,
        },
      };

      // Force a complete reload of the store with only chapter-specific pages
      store.loadJSON(cleanBase);

      console.log(
        "Loaded chapter pages for:",
        chapterKey,
        "pages:",
        pages.length,
        "store now has:",
        store.toJSON().pages?.length || 0
      );
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
      toast.error(
        "Cannot delete the last module. At least one module must exist."
      );
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
      toast.error(
        "Cannot delete the last chapter. At least one chapter must exist."
      );
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

    // If expanding a chapter, collapse all other chapters in the same module and make this one active
    if (!isCurrentlyExpanded && moduleId === activeModuleId) {
      // First save current chapter pages before switching
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
        console.log(
          "Saved current chapter before switching:",
          currentChapterKey
        );
      } catch (e) {
        console.error("Error saving current chapter before switching:", e);
      }

      setModules(
        modules.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                chapters: module.chapters.map((chapter) =>
                  chapter.id === chapterId
                    ? { ...chapter, isExpanded: true }
                    : { ...chapter, isExpanded: false }
                ),
              }
            : module
        )
      );
      setActiveChapterId(chapterId);

      // Clear the store completely before loading new chapter pages
      try {
        store.loadJSON({ pages: [] });
        console.log("Cleared store before loading chapter pages");
      } catch (e) {
        console.error("Error clearing store:", e);
      }

      // Load the new chapter's pages
      setTimeout(() => {
        console.log(
          "About to load chapter pages for:",
          getChapterKey(moduleId, chapterId)
        );
        loadChapterPages(moduleId, chapterId);
        console.log(
          "Store pages after loading:",
          store.toJSON().pages?.length || 0
        );
      }, 50);
    } else if (isCurrentlyExpanded && moduleId === activeModuleId) {
      // If collapsing the currently active chapter, just collapse it
      setModules(
        modules.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                chapters: module.chapters.map((chapter) =>
                  chapter.id === chapterId
                    ? { ...chapter, isExpanded: false }
                    : chapter
                ),
              }
            : module
        )
      );
    }
  };

  const handleCreateItem = () => {
    if (!newItemName.trim()) return;

    if (createType === "module") {
      // Check for duplicate module names
      const trimmedName = newItemName.trim();
      const existingModule = modules.find(
        (module) => module.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingModule && existingModule.id !== editingModuleId) {
        toast.error(
          `A module with the name "${trimmedName}" already exists. Please choose a different name.`
        );
        return;
      }
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
      // Check for duplicate chapter names within the same module
      const trimmedName = newItemName.trim();
      const currentModule = modules.find(
        (module) => module.id === activeModuleId
      );

      if (currentModule) {
        const existingChapter = currentModule.chapters.find(
          (chapter) => chapter.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (existingChapter) {
          toast.error(
            `A chapter with the name "${trimmedName}" already exists in this module. Please choose a different name.`
          );
          return;
        }
      }

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

  // Load active chapter pages after initialization
  React.useEffect(() => {
    if (activeModuleId && activeChapterId && modules.length > 0) {
      console.log(
        "Loading active chapter pages on mount:",
        activeModuleId,
        activeChapterId
      );
      // Add a small delay to ensure store is ready
      setTimeout(() => {
        loadChapterPages(activeModuleId, activeChapterId);
      }, 100);
    }
  }, [activeModuleId, activeChapterId, modules]);

  // Notify parent component when modules change
  React.useEffect(() => {
    if (onModulesChange) {
      onModulesChange({
        modules,
        chapterPagesRef,
        activeModuleId,
        activeChapterId,
      });
    }
  }, [
    modules,
    chapterPagesRef,
    activeModuleId,
    activeChapterId,
    onModulesChange,
  ]);

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

  // Save current chapter pages periodically to avoid cross-contamination
  React.useEffect(() => {
    // Initialize the current chapter pages snapshot
    try {
      const current = store.toJSON();
      const currentChapterKey = getChapterKey(activeModuleId, activeChapterId);
      if (!chapterPagesRef.current[currentChapterKey]) {
        chapterPagesRef.current[currentChapterKey] = current.pages || [];
        localStorage.setItem(
          "polotno-demo-chapter-pages",
          JSON.stringify(chapterPagesRef.current)
        );
        console.log("Initialized chapter pages for:", currentChapterKey);
      }
    } catch (e) {
      console.error("Error initializing chapter pages:", e);
    }

    // Save current chapter pages every 2 seconds to capture page additions
    const saveInterval = setInterval(() => {
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
        console.log(
          "Periodic save for chapter:",
          currentChapterKey,
          "pages:",
          current.pages?.length || 0
        );
      } catch (e) {
        console.error("Error in periodic save:", e);
      }
    }, 2000);

    return () => {
      clearInterval(saveInterval);
    };
  }, [activeModuleId, activeChapterId]);

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

                      {/* Pages under this chapter - render default PagesTimeline ONLY for active module, expanded chapter, AND currently active chapter */}
                      {chapter.isExpanded &&
                        module.id === activeModuleId &&
                        chapter.id === activeChapterId && (
                          <div style={{ marginLeft: "10px" }}>
                            <div
                              style={{
                                overflow: "hidden",
                                position: "relative",
                              }}
                            >
                              <PagesTimeline
                                store={store}
                                defaultOpened={true}
                              />
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

export default HierarchicalPagesNavigation;
