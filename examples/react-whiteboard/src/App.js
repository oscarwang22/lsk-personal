import { useState, useCallback, useEffect, memo } from "react";
import {
  useMyPresence,
  useMap,
  useHistory,
  useBatch,
  useSelf,
  useRoom,
} from "@liveblocks/react";
import { LiveObject } from "@liveblocks/client";

import "./App.css";

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

function connectionIdToColor(connectionId) {
  return COLORS[connectionId % COLORS.length];
}

export default function App() {
  const layers = useMap("layers");

  if (layers == null) {
    return <div>Loading</div>;
  }

  return <Canvas layers={layers} />;
}

function Canvas({ layers }) {
  const [isDragging, setIsDragging] = useState(false);

  const [{ selectedLayer }, setPresence] = useMyPresence();
  const batch = useBatch();
  const history = useHistory();
  const me = useSelf();

  const myColor = connectionIdToColor(me.connectionId);

  const insertLayer = useCallback(() => {
    batch(() => {
      const layerId = Date.now() + Math.random() * 100;
      const layer = new LiveObject({
        type: "rectangle",
        x: Math.floor(Math.random() * 300),
        y: Math.floor(Math.random() * 300),
        height: 100,
        width: 100,
        fill: myColor,
      });
      layers.set(layerId, layer);
      setPresence({ selectedLayer: layerId }, { addToHistory: true });
    });
  }, [batch, layers, setPresence, myColor]);

  const deleteSelectedLayer = useCallback(() => {
    layers.delete(selectedLayer);
    setPresence({ selectedLayer: null });
  }, [layers, selectedLayer]);

  useEffect(() => {
    function onKeyDown(e) {
      switch (e.key) {
        case "Backspace": {
          deleteSelectedLayer();
          break;
        }
        case "z": {
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              history.redo();
            } else {
              history.undo();
            }
            break;
          }
        }
        case "i": {
          insertLayer();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [history, insertLayer, deleteSelectedLayer]);

  const onLayerPointerDown = useCallback(
    (e, layerId) => {
      history.pause();
      e.stopPropagation();

      setPresence({ selectedLayer: layerId }, { addToHistory: true });

      setIsDragging(true);
    },
    [setPresence, setIsDragging, selectedLayer, history]
  );

  const unselectLayer = useCallback(() => {
    setPresence({ selectedLayer: null }, { addToHistory: true });
  }, [setPresence]);

  const onCanvasPointerUp = useCallback(
    (e) => {
      if (!isDragging) {
        unselectLayer();
      }

      setIsDragging(false);

      history.resume();
    },
    [isDragging, history]
  );

  const onCanvasPointerMove = useCallback(
    (e) => {
      e.preventDefault();

      if (isDragging) {
        const layer = layers.get(selectedLayer);
        if (layer) {
          layer.update({
            x: layer.get("x") + e.movementX,
            y: layer.get("y") + e.movementY,
          });
        }
      }
    },
    [isDragging, selectedLayer]
  );

  return (
    <>
      <div
        className="canvas"
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
      >
        {Array.from(layers, ([layerId, layer]) => {
          return (
            <LayerComponent
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              layer={layer}
              selectionColor={selectedLayer === layerId ? "blue" : undefined}
            />
          );
        })}
      </div>
    </>
  );
}

const LayerComponent = memo(
  ({ layer, onLayerPointerDown, id, selectionColor }) => {
    const [layerData, setLayerData] = useState(layer.toObject());

    const room = useRoom();

    useEffect(() => {
      function onChange() {
        setLayerData(layer.toObject());
      }

      return room.subscribe(layer, onChange);
    }, [room, layer]);

    return (
      <div
        onPointerDown={(e) => onLayerPointerDown(e, id)}
        style={{
          transition: "all 0.1s ease",
          transform: `translate(${layerData.x}px, ${layerData.y}px)`,
          height: layerData.height,
          width: layerData.width,
          backgroundColor: layerData.fill ? layerData.fill : "#CCC",
          borderColor: selectionColor || "transparent",
          strokeWidth: 1,
          borderStyle: "solid",
          borderWidth: "2px",
        }}
      ></div>
    );
  }
);
