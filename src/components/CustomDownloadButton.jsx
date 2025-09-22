import { Button, Menu, MenuItem, Popover, Position } from "@blueprintjs/core";
import { Download } from "@blueprintjs/icons";
import { saveAs } from "file-saver";

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

export default CustomDownloadButton;
