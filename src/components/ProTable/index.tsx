import React,{useEffect,useMemo,useRef,useCallback} from 'react';
// import ProTable from '@ant-design/pro-table';
import {Table,Space,Button} from 'antd'
import ColumnSetting from './ColumnSetting'
import Container from './utils/container'
import type { ParamsType } from '@ant-design/pro-provider';
import { genProColumnToColumn } from './utils/genProColumnToColumn';
import {genColumnKey,useActionType,parseDefaultColumnConfig,mergePagination} from './utils'
import { columnSort } from './utils/columnSort';
import { stringify } from 'use-json-comparison';
import classNames from 'classnames';
import type { TablePaginationConfig } from 'antd';
import useFetchData from './utils/useFetchData';
import type {
  TableCurrentDataSource,
  SorterResult,
  SortOrder,
  GetRowKey,
} from 'antd/lib/table/interface';
import {
  useDeepCompareEffect,
  omitUndefined,
  useMountMergeState
} from '@ant-design/pro-utils';
import {  
  PageInfo,
  ProTableProps,
  RequestData,
  TableRowSelection,
  UseFetchDataAction,} from './utils/typing'

function TableRender<T extends Record<string, any>, U, ValueType>(
  props: ProTableProps<T, U, ValueType> & {
    action: UseFetchDataAction<any>;
    tableColumn: any[];
    toolbarDom: JSX.Element | null;
    onSortChange: (sort: any) => void;
    onFilterChange: (sort: any) => void;
    rootRef: React.RefObject<HTMLDivElement>;
  },
) {
  const {
    rowKey,
    tableClassName,
    action,
    tableColumn,
    type,
    pagination,
    rowSelection,
    size,
    tableStyle,
    toolbarDom,
    style,
    cardProps,
    onSortChange,
    onFilterChange,
    options,
    className,
    cardBordered,
    rootRef,
    ...rest
  } = props;
  const counter = Container.useContainer();

  const columns = useMemo(() => {
    return tableColumn.filter((item) => {
      // 删掉不应该显示的
      const columnKey = genColumnKey(item.key, item.index);
      const config = counter.columnsMap[columnKey];
      if (config && config.show === false) {
        return false;
      }
      return true;
    });
  }, [counter.columnsMap, tableColumn]);

  /** 如果所有列中的 filters=true| undefined 说明是用的是本地筛选 任何一列配置 filters=false，就能绕过这个判断 */
  const useLocaleFilter = useMemo(
    () =>
      columns?.every(
        (column) =>
          (column.filters === true && column.onFilter === true) ||
          (column.filters === undefined && column.onFilter === undefined),
      ),
    [columns],
  );


  const getTableProps = () => ({
    ...rest,
    size,
    rowSelection: rowSelection === false ? undefined : rowSelection,
    className: tableClassName,
    style: tableStyle,
    columns,
    loading: action.loading,
    dataSource:  action.dataSource,
    pagination,
    onChange: (
      changePagination: TablePaginationConfig,
      filters: Record<string, (React.Key | boolean)[] | null>,
      sorter: SorterResult<T> | SorterResult<T>[],
      extra: TableCurrentDataSource<T>,
    ) => {
      rest.onChange?.(changePagination, filters, sorter, extra);
      if (!useLocaleFilter) {
        onFilterChange(omitUndefined<any>(filters));
      }
      // 制造筛选的数据
      // 制造一个排序的数据
      if (Array.isArray(sorter)) {
        const data = sorter.reduce<Record<string, any>>(
          (pre, value) => ({
            ...pre,
            [`${value.field}`]: value.order,
          }),
          {},
        );
        onSortChange(omitUndefined<any>(data));
      } else {
        const sorterOfColumn = sorter.column?.sorter;
        const isSortByField = sorterOfColumn?.toString() === sorterOfColumn;
        onSortChange(
          omitUndefined({
            [`${isSortByField ? sorterOfColumn : sorter.field}`]: sorter.order as SortOrder,
          }) || {},
        );
      }
    },
  });

  /** 如果有 ellipsis ，设置 tableLayout 为 fixed */
  const tableLayout =
    // 优先以用户设置为准
    props.tableLayout ?? props.columns?.some((item) => item.ellipsis) ? 'fixed' : 'auto';

  /** 默认的 table dom，如果是编辑模式，外面还要包个 form */
  const baseTableDom = (
    <>
    <ColumnSetting columns={tableColumn} />
    <Table<T> {...getTableProps()} rowKey={rowKey} tableLayout={tableLayout} />
    </>
  )

  /** 自定义的 render */
  const tableDom = props.tableViewRender
    ? props.tableViewRender(
        {
          ...getTableProps(),
          rowSelection: rowSelection !== false ? rowSelection : undefined,
        },
        baseTableDom,
      )
    : baseTableDom;


  const renderTable = () => {
    if (props.tableRender) {
      return props.tableRender(props, tableDom, {
        toolbar: toolbarDom || undefined,
        table: tableDom || undefined,
      });
    }
    return tableDom;
  };

  const proTableDom = (
    <div
      className={classNames(className, {
        [`${className}-polling`]: action.pollingLoading,
      })}
      style={style}
      ref={rootRef}
    >
      {/* 渲染一个额外的区域，用于一些自定义 */}
      {type !== 'form' && props.tableExtraRender && action.dataSource && (
        <div className={`${className}-extra`}>
          {props.tableExtraRender(props, action.dataSource)}
        </div>
      )}
      {type !== 'form' && renderTable()}
    </div>
  );

    return proTableDom;
}

const ProTable = <T extends Record<string, any>, U extends ParamsType, ValueType>(
  props: ProTableProps<T, U, ValueType> & {
    defaultClassName: string;
  },
) => {
  const {
    cardBordered,
    request,
    className: propsClassName,
    params = {},
    defaultData,
    headerTitle,
    postData,
    pagination: propsPagination,
    actionRef: propsActionRef,
    columns: propsColumns = [],
    toolBarRender,
    onLoad,
    onRequestError,
    style,
    cardProps,
    tableStyle,
    tableClassName,
    columnsStateMap,
    onColumnsStateChange,
    options,
    search,
    onLoadingChange,
    rowSelection: propsRowSelection = false,
    beforeSearchSubmit,
    tableAlertRender,
    defaultClassName,
    formRef: propRef,
    type = 'table',
    columnEmptyText = '-',
    toolbar,
    rowKey,
    manualRequest,
    polling,
    tooltip,
    ...rest
  } = props;

  const className = classNames(defaultClassName, propsClassName);

  /** 通用的来操作子节点的工具类 */
  const actionRef = useRef<ActionType>();

  const defaultFormRef = useRef();
  const formRef = propRef || defaultFormRef;

  useEffect(() => {
    if (typeof propsActionRef === 'function' && actionRef.current) {
      propsActionRef(actionRef.current);
    }
  }, [propsActionRef]);

  /** 单选多选的相关逻辑 */
  const [selectedRowKeys, setSelectedRowKeys] = useMountMergeState<React.ReactText[]>([], {
    value: propsRowSelection ? propsRowSelection.selectedRowKeys : undefined,
  });

  const selectedRowsRef = useRef<T[]>([]);

  const setSelectedRowsAndKey = useCallback(
    (keys: React.ReactText[], rows: T[]) => {
      setSelectedRowKeys(keys);
      if (!propsRowSelection || !propsRowSelection?.selectedRowKeys) {
        selectedRowsRef.current = rows;
      }
    },
    [setSelectedRowKeys],
  );

  const [formSearch, setFormSearch] = useMountMergeState<Record<string, any> | undefined>(() => {
    // 如果手动模式，或者 search 不存在的时候设置为 undefined
    // undefined 就不会触发首次加载
    if (manualRequest || search !== false) {
      return undefined;
    }
    return {};
  });

  const [proFilter, setProFilter] = useMountMergeState<Record<string, React.ReactText[] | null>>(
    {},
  );
  const [proSort, setProSort] = useMountMergeState<Record<string, SortOrder>>({});

  /** 设置默认排序和筛选值 */
  useEffect(() => {
    const { sort, filter } = parseDefaultColumnConfig(propsColumns);
    setProFilter(filter);
    setProSort(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 获取 table 的 dom ref */
  const rootRef = useRef<HTMLDivElement>(null);

  /** 需要初始化 不然默认可能报错 这里取了 defaultCurrent 和 current 为了保证不会重复刷新 */
  const fetchPagination =
    typeof propsPagination === 'object'
      ? (propsPagination as TablePaginationConfig)
      : { defaultCurrent: 1, defaultPageSize: 20, pageSize: 20, current: 1 };

  // ============================ useFetchData ============================
  const fetchData = useMemo(() => {
    if (!request) return undefined;
    return async (pageParams?: Record<string, any>) => {
      const actionParams = {
        ...(pageParams || {}),
        ...formSearch,
        ...params,
      };
      // eslint-disable-next-line no-underscore-dangle
      delete (actionParams as any)._timestamp;
      const response = await request(actionParams as unknown as U, proSort, proFilter);
      return response as RequestData<T>;
    };
  }, [formSearch, params, proFilter, proSort, request]);

  const action = useFetchData(fetchData, defaultData, {
    pageInfo: propsPagination === false ? false : fetchPagination,
    loading: props.loading,
    dataSource: props.dataSource,
    onDataSourceChange: props.onDataSourceChange,
    onLoad,
    onLoadingChange,
    onRequestError,
    postData,
    manual: formSearch === undefined,
    polling,
    effects: [stringify(params), stringify(formSearch), stringify(proFilter), stringify(proSort)],
    debounceTime: props.debounceTime,
    onPageInfoChange: (pageInfo) => {
      // 总是触发一下 onChange 和  onShowSizeChange
      // 目前只有 List 和 Table 支持分页, List 有分页的时候打断 Table 的分页
      if (propsPagination && type !== 'list') {
        propsPagination?.onChange?.(pageInfo.current, pageInfo.pageSize);
        propsPagination?.onShowSizeChange?.(pageInfo.current, pageInfo.pageSize);
      }
    },
  });
  // ============================ END ============================

  /** SelectedRowKeys受控处理selectRows */
  const preserveRecordsRef = React.useRef(new Map<any, T>());

  // ============================ RowKey ============================
  const getRowKey = React.useMemo<GetRowKey<any>>(() => {
    if (typeof rowKey === 'function') {
      return rowKey;
    }
    return (record: T, index?: number) => (record as any)?.[rowKey as string] ?? index;
  }, [rowKey]);

  useMemo(() => {
    if (action.dataSource?.length) {
      const newCache = new Map<any, T>();
      const keys = action.dataSource.map((data, index) => {
        const dataRowKey = getRowKey(data, index) as string;
        newCache.set(dataRowKey, data);
        return dataRowKey;
      });
      preserveRecordsRef.current = newCache;
      return keys;
    }
    return [];
  }, [action.dataSource]);

  useEffect(() => {
    selectedRowsRef.current = selectedRowKeys?.map(
      (key): T => preserveRecordsRef.current?.get(key) as T,
    );
  }, [selectedRowKeys]);

  /** 页面编辑的计算 */
  const pagination = useMemo(() => {
    const pageConfig = {
      ...action.pageInfo,
      setPageInfo: ({ pageSize, current }: PageInfo) => {
        const { pageInfo } = action;
        // pageSize 发生改变，并且你不是在第一页，切回到第一页
        // 这样可以防止出现 跳转到一个空的数据页的问题
        if (pageSize === pageInfo.pageSize || pageInfo.current === 1) {
          action.setPageInfo({ pageSize, current });
          return;
        }

        // 通过request的时候清空数据，然后刷新不然可能会导致 pageSize 没有数据多
        if (request) action.setDataSource([]);

        requestAnimationFrame(() => {
          action.setPageInfo({
            pageSize,
            current: 1,
          });
        });
      },
    };
    return mergePagination<T>(propsPagination, pageConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsPagination, action]);

  const counter = Container.useContainer();

  /** 清空所有的选中项 */
  const onCleanSelected = useCallback(() => {
    if (propsRowSelection && propsRowSelection.onChange) {
      propsRowSelection.onChange([], []);
    }
    setSelectedRowsAndKey([], []);
  }, [propsRowSelection, setSelectedRowsAndKey]);

  counter.setAction(actionRef.current);
  counter.propsRef.current = props;


  /** 绑定 action */
  useActionType(actionRef, action, {
    onCleanSelected: () => {
      // 清空选中行
      onCleanSelected();
    },
    resetAll: () => {
      // 清空选中行
      onCleanSelected();
      // 清空筛选
      setProFilter({});
      // 清空排序
      setProSort({});
      // 清空 toolbar 搜索
      counter.setKeyWords(undefined);
      // 重置页码
      action.setPageInfo({
        current: 1,
      });

      // 重置表单
      formRef?.current?.resetFields();
      setFormSearch({});
    }
  });

  if (propsActionRef) {
    // @ts-ignore
    propsActionRef.current = actionRef.current;
  }

  // ---------- 列计算相关 start  -----------------
  const tableColumn = useMemo(() => {
    return genProColumnToColumn<T>({
      columns: propsColumns,
      counter,
      columnEmptyText,
      type,
    }).sort(columnSort(counter.columnsMap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    propsColumns,
    counter,
    columnEmptyText,
    type,
  ]);

  /** Table Column 变化的时候更新一下，这个参数将会用于渲染 */
  useDeepCompareEffect(() => {
    if (tableColumn && tableColumn.length > 0) {
      // 重新生成key的字符串用于排序
      const columnKeys = tableColumn.map((item) => genColumnKey(item.key, item.index));
      counter.setSortKeyColumns(columnKeys);
    }
  }, [tableColumn]);

  /** 同步 Pagination，支持受控的 页码 和 pageSize */
  useDeepCompareEffect(() => {
    const { pageInfo } = action;
    const { current = pageInfo?.current, pageSize = pageInfo?.pageSize } = propsPagination || {};
    if (
      propsPagination &&
      (current || pageSize) &&
      (pageSize !== pageInfo?.pageSize || current !== pageInfo?.current)
    ) {
      action.setPageInfo({
        pageSize: pageSize || pageInfo.pageSize,
        current: current || pageInfo.current,
      });
    }
  }, [propsPagination && propsPagination.pageSize, propsPagination && propsPagination.current]);

  /** 行选择相关的问题 */
  const rowSelection: TableRowSelection = {
    selectedRowKeys,
    ...propsRowSelection,
    onChange: (keys, rows) => {
      if (propsRowSelection && propsRowSelection.onChange) {
        propsRowSelection.onChange(keys, rows);
      }
      setSelectedRowsAndKey(keys, rows);
    },
  };

  /** 内置的工具栏 */
  const toolbarDom = <ColumnSetting columns={tableColumn} />

  return (
    <TableRender
      {...props}
      rootRef={rootRef}
      pagination={pagination}
      rowSelection={propsRowSelection !== false ? rowSelection : undefined}
      className={className}
      tableColumn={tableColumn}
      action={action}
      toolbarDom={toolbarDom}
      onSortChange={setProSort}
      onFilterChange={setProFilter}
    />
  );
};

/**
 * 🏆 Use Ant Design Table like a Pro! 更快 更好 更方便
 *
 * @param props
 */
const ProviderWarp = <
  DataType extends Record<string, any>,
  Params extends ParamsType = ParamsType,
  ValueType = 'text',
>(
  props: ProTableProps<DataType, Params, ValueType>,
) => {
  return (
    <Container.Provider initialState={props}>
          <ProTable<DataType, Params, ValueType>
            defaultClassName={"test"}
            {...props}
          />
    </Container.Provider>
  );
};

ProviderWarp.Summary = Table.Summary;

export default ProviderWarp;
