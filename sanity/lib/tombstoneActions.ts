import { RestoreIcon } from "@sanity/icons/Restore";
import { useDocumentOperation } from "sanity";
import type { DocumentActionComponent } from "sanity";

/**
 * "Restore asset" — deletes the tombstone document, cancelling the scheduled
 * permanent deletion. The underlying Cloudinary/Mux asset is untouched.
 */
export const RestoreTombstoneAction: DocumentActionComponent = (props) => {
  const { del } = useDocumentOperation(props.id, props.type);

  if (props.type !== "mediaTombstone") return null;

  return {
    label: "Restore asset",
    icon: RestoreIcon,
    tone: "positive",
    onHandle: () => {
      del.execute();
      props.onComplete();
    },
  };
};
