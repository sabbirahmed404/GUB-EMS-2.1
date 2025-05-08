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
          "rounded-lg overflow-hidden border border-blue-100 shadow-sm bg-white w-full mobile-full-width",
          className
        )}
        {...props}
      >
        <div className="overflow-x-auto w-full">
          <Table className="w-full divide-y divide-blue-100">
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
        "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
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
    className={cn("px-4 py-3 whitespace-nowrap text-sm", className)}
    {...props}
  />
);
DataTableCell.displayName = "DataTableCell";

// Add custom styles to fix mobile view
React.useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    /* Custom responsive table styles for mobile */
    @media screen and (max-width: 640px) {
      .mobile-full-width {
        width: 100% !important;
        max-width: 100% !important; 
        margin-left: 0 !important;
        margin-right: 0 !important;
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
      }
      
      .bg-blue-50.rounded-lg > div {
        padding: 0 !important;
        margin-bottom: 0 !important;
      }
      
      .responsiveTable {
        width: 100% !important;
        margin: 0 !important;
      }
      
      /* Target mobile-collapsed view */
      .responsiveTable tbody td {
        padding-left: 16px !important;
        padding-right: 16px !important;
        border-bottom: 1px solid #e6f0ff !important;
      }
      
      .responsiveTable td:before {
        font-weight: 600 !important;
        color: #1e40af !important;
        width: 120px !important;
        padding-left: 0 !important;
      }
      
      .responsiveTable tr {
        margin-bottom: 8px !important;
        border: none !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
      }
    }
  `;
  document.head.appendChild(style);
  return () => {
    document.head.removeChild(style);
  };
}, []);

export {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
}; 