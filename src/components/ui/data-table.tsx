import * as React from "react";
import { cn } from "../../lib/utils";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg overflow-hidden border border-blue-100 shadow-sm bg-white",
          className
        )}
        {...props}
      >
        <div className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-blue-100">
            {children}
          </Table>
        </div>
      </div>
    );
  }
);
DataTable.displayName = "DataTable";

interface DataTableHeaderProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

const DataTableHeader: React.FC<DataTableHeaderProps> = ({ 
  className, 
  ...props 
}) => (
  <Thead className={cn("bg-blue-800 text-white", className)} {...props} />
);
DataTableHeader.displayName = "DataTableHeader";

interface DataTableBodyProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

const DataTableBody: React.FC<DataTableBodyProps> = ({ 
  className, 
  ...props 
}) => (
  <Tbody className={cn("bg-white divide-y divide-blue-50", className)} {...props} />
);
DataTableBody.displayName = "DataTableBody";

interface DataTableRowProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  isHeader?: boolean;
}

const DataTableRow: React.FC<DataTableRowProps> = ({ 
  className, 
  isHeader,
  ...props 
}) => (
  <Tr
    className={cn(
      isHeader
        ? ""
        : "hover:bg-blue-50 transition-colors",
      className
    )}
    {...props}
  />
);
DataTableRow.displayName = "DataTableRow";

interface DataTableHeadProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  isSortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
}

const DataTableHead: React.FC<DataTableHeadProps> = ({ 
  className, 
  isSortable, 
  sortDirection, 
  onSort, 
  children,
  ...props 
}) => {
  const handleSort = () => {
    if (isSortable && onSort) {
      onSort();
    }
  };

  return (
    <Th
      className={cn(
        "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
        isSortable && "cursor-pointer hover:bg-blue-700",
        className
      )}
      onClick={handleSort}
      {...props}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {isSortable && sortDirection && (
          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </Th>
  );
};
DataTableHead.displayName = "DataTableHead";

interface DataTableCellProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

const DataTableCell: React.FC<DataTableCellProps> = ({ 
  className, 
  ...props 
}) => (
  <Td
    className={cn("px-6 py-4 whitespace-nowrap text-sm", className)}
    {...props}
  />
);
DataTableCell.displayName = "DataTableCell";

export {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
}; 