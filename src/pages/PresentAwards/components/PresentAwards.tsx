import React from "react";
import SummitAchievement from "../models/SummitAchievement";
import moment from "moment";
import { ToastComponent, ToastHandle } from "@/components/ToastComponent";
import { DatePickerComponent } from "@/components/DateTimeInputs";
import { DataGrid, DataGridColumn, DataGridCustomToolbarAction } from "@/components/DataGrid";

import { useEffect, useMemo, useRef, useState } from "react";

interface AwardsTableProps {
  items: SummitAchievement[];
  onUpdate: (PresentedItems: SummitAchievement[]) => void;
}

export default function AwardsTable(props: AwardsTableProps): React.ReactNode {
  const [items, setItems] = useState<SummitAchievement[]>(props.items);
  const [showPreviouslyPresented, setShowPreviouslyPresented] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(props.items.filter((item) => item.presented !== "No").map((item) => item.id)));
  const toastRef = useRef<ToastHandle>(null);

  useEffect(() => {
    setItems(props.items);
    setSelectedIds(new Set(props.items.filter((item) => item.presented !== "No").map((item) => item.id)));
  }, [props.items]);

  const dateUpdated = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const formatted = moment(event.target.value).format("DD/MM/YY");
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) {
          return item;
        }

        item.updatePresented(formatted);
        return item;
      }),
    );
  };

  const setSelected = (item: SummitAchievement, isSelected: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (isSelected) {
        next.add(item.id);
      } else {
        next.delete(item.id);
      }
      return next;
    });

    setItems((currentItems) =>
      currentItems.map((currentItem) => {
        if (currentItem.id !== item.id) {
          return currentItem;
        }

        if (isSelected && (!currentItem.presented || currentItem.presented === "No")) {
          currentItem.updatePresented(currentItem.dateAwarded);
        }

        if (!isSelected) {
          currentItem.updatePresented("No");
        }

        return currentItem;
      }),
    );
  };

  const presentedCellTemplate = (item: SummitAchievement) => {
    if (!item.presented || item.presented === "No") {
      return <span>No</span>;
    }

    return <DatePickerComponent value={moment(item.presented ?? "01/01/2000", "DD/MM/YYYY").toDate()} format="dd/MM/yy" showClearButton={false} onChange={(event) => dateUpdated(event, item.id)} />;
  };

  const saveChanges = () => {
    const selectedRecords = items.filter((item) => selectedIds.has(item.id));
    if (selectedRecords.length === 0) {
      toastRef.current?.show();
      return;
    }

    const filteredItems = items.filter((item) => item.presented !== "No" || selectedIds.has(item.id));
    props.onUpdate(filteredItems);
  };

  const visibleItems = useMemo(() => {
    if (showPreviouslyPresented) {
      return items;
    }

    return items.filter((item) => !item.previouslyPresented);
  }, [items, showPreviouslyPresented]);

  const toolbarActions: Array<"pdf" | "excel" | DataGridCustomToolbarAction> = [
    "pdf",
    "excel",
    {
      id: "show_presented",
      label: showPreviouslyPresented ? "Hide Previously Presented" : "Show Previously Presented",
      onClick: () => setShowPreviouslyPresented((current) => !current),
    },
    {
      id: "present_awards",
      label: "Save Changes",
      align: "right",
      onClick: saveChanges,
    },
  ];

  const columns: DataGridColumn<SummitAchievement>[] = [
    {
      id: "member",
      header: "Name",
      accessorKey: "member",
      enableSorting: true,
    },
    {
      id: "type",
      header: "Type",
      accessorKey: "type",
      enableSorting: true,
    },
    {
      id: "achievementName",
      header: "Award",
      accessorKey: "achievementName",
      enableSorting: true,
    },
    {
      id: "dateAwarded",
      header: "Date",
      accessorKey: "dateAwarded",
      enableSorting: true,
    },
    {
      id: "presented",
      header: "Presented",
      accessorFn: (row) => row.presented,
      cell: presentedCellTemplate,
      enableSorting: true,
    },
    {
      id: "present",
      header: "Present",
      cell: (item) => {
        return <input type="checkbox" checked={selectedIds.has(item.id)} onChange={(event) => setSelected(item, event.target.checked)} />;
      },
      exportable: false,
    },
  ];

  return (
    <>
      <div id="#toast_target" />
      <ToastComponent id="toast_target" ref={toastRef} title="Warning" content="No new awards were selected as presented." />
      <DataGrid
        id="Grid"
        data={visibleItems}
        columns={columns}
        toolbarActions={toolbarActions}
        exportOptions={{
          fileNamePrefix: "Awards",
          title: "Terrain | Summit - Awards Completed",
          columns: [
            { key: "member", header: "Name" },
            { key: "type", header: "Type" },
            { key: "achievementName", header: "Award" },
            { key: "dateAwarded", header: "Date" },
            { key: "presented", header: "Presented" },
          ],
        }}
      />
    </>
  );
}
