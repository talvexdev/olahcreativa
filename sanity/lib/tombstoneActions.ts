import { UndoIcon } from "@sanity/icons";
import { useClient } from "sanity";
import type { DocumentActionComponent } from "sanity";

/**
 * "Restore asset" — deletes the tombstone document, cancelling the scheduled
 * permanent deletion. The underlying Cloudinary/Mux asset is untouched.
 */
export const restoreTombstoneAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: "2025-01-01" });

  if (props.type !== "mediaTombstone") return null;

  return {
    label: "Restore asset",
    icon: UndoIcon,
    tone: "positive",
    onHandle: async () => {
      await client.delete(props.id);
      props.onComplete();
    },
  };
};
