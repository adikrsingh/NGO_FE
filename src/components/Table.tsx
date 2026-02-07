import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

type TableProps<T> = {
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  rowKey?: string | ((record: T) => string | number);
};

function CustomTable<T>({ columns, data, loading, rowKey }: TableProps<T>) {
  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey={rowKey ?? "id"}
      pagination={{ pageSize: 10 }}
    />
  );
}

export default CustomTable;
