import { ColumnDef } from '@tanstack/react-table';

interface BaseFilterControlsProps<TData> {
  table: any;
  columns: ColumnDef<TData, any>[];
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export type { BaseFilterControlsProps };
